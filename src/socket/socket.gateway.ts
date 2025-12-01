import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import * as url from 'url';
import * as WebSocket from 'ws';
import { Server } from 'ws';
import { AuthService } from '../components/auth/auth.service';
import { User } from '../libs/entities/user';
import { SocketEvent } from '../libs/enums/socket-event.enum';

interface ConnectedClient {
  socket: WebSocket;
  user: User;
  rooms: Set<string>;
  lastActivity: Date;
}

@WebSocketGateway({
  cors: {
    origin: '*', // Vaqtinchalik hamma joydan ruxsat berish
    credentials: true,
  },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger: Logger = new Logger('SocketGateway');
  private clients = new Map<WebSocket, ConnectedClient>();
  private userSockets = new Map<string, Set<WebSocket>>(); // userId -> Set of sockets
  private rooms = new Map<string, Set<WebSocket>>(); // roomId -> Set of sockets

  constructor(private authService: AuthService) {}

  @WebSocketServer()
  server: Server;

  public afterInit(server: Server) {
    this.logger.log(`WebSocket Server Initialized`);
  }

  // Token ni URL query parametridan olish
  private async retrieveAuth(req: any): Promise<User | null> {
    try {
      const parseUrl = url.parse(req.url, true);
      const { token } = parseUrl.query;
      if (!token) {
        return null;
      }
      return await this.authService.verifyToken(token as string);
    } catch (error) {
      this.logger.warn('Authentication failed:', error.message);
      return null;
    }
  }

  // Client ulanganda
  public async handleConnection(client: WebSocket, req: any) {
    this.logger.log(`Connection attempt from ${req.socket.remoteAddress}`);
    const authUser = await this.retrieveAuth(req);

    if (!authUser) {
      this.logger.warn(
        `Unauthorized connection attempt from ${req.socket.remoteAddress}`,
      );
      client.send(
        JSON.stringify({
          event: 'error',
          message: 'Unauthorized: Invalid or missing token',
        }),
      );
      client.close(1008, 'Unauthorized');
      return;
    }

    // Client malumotlarini saqlash
    const clientData: ConnectedClient = {
      socket: client,
      user: authUser,
      rooms: new Set(),
      lastActivity: new Date(),
    };

    this.clients.set(client, clientData);

    // User sockets map ga qoshish
    if (!this.userSockets.has(authUser.id)) {
      this.userSockets.set(authUser.id, new Set());
    }
    this.userSockets.get(authUser.id).add(client);

    // User o'zining roomiga qo'shiladi
    const userRoom = `user:${authUser.id}`;
    this.joinRoom(client, userRoom);

    this.logger.log(
      `Client connected: ${authUser.fullName} (${authUser.id}). Total: ${this.clients.size}`,
    );

    // Connection info yuborish
    client.send(
      JSON.stringify({
        event: SocketEvent.CONNECTION_INFO,
        data: {
          userId: authUser.id,
          totalClients: this.clients.size,
          onlineUsers: Array.from(this.userSockets.keys()).length,
        },
      }),
    );

    // Boshqa userlarga online status yuborish
    this.broadcast(
      SocketEvent.USER_ONLINE,
      { userId: authUser.id, user: authUser },
      client,
    );
  }

  // Client uzilganda
  public handleDisconnect(client: WebSocket) {
    const clientData = this.clients.get(client);

    if (!clientData) {
      return;
    }

    const { user, rooms } = clientData;

    // Barcha roomlardan chiqarish
    rooms.forEach((room) => this.leaveRoom(client, room));

    // Client ma'lumotlarini o'chirish
    this.clients.delete(client);

    // User sockets map dan o'chirish
    const userSocketsSet = this.userSockets.get(user.id);
    if (userSocketsSet) {
      userSocketsSet.delete(client);
      if (userSocketsSet.size === 0) {
        this.userSockets.delete(user.id);
        // User offline bo'ldi
        this.broadcast(SocketEvent.USER_OFFLINE, { userId: user.id });
      }
    }

    this.logger.log(
      `Client disconnected: ${user.fullName} (${user.id}). Total: ${this.clients.size}`,
    );
  }

  // Message event
  @SubscribeMessage('message')
  public async handleMessage(client: WebSocket, payload: any): Promise<void> {
    const clientData = this.clients.get(client);

    if (!clientData) {
      client.send(
        JSON.stringify({
          event: SocketEvent.ERROR,
          message: 'Not authenticated',
        }),
      );
      return;
    }

    const { user } = clientData;
    clientData.lastActivity = new Date();

    // Payloadni tekshirish
    let messageText = '';
    if (typeof payload === 'string') {
      try {
        const parsed = JSON.parse(payload);
        messageText = parsed.text || parsed.message || payload;
      } catch {
        messageText = payload;
      }
    } else if (typeof payload === 'object') {
      messageText = payload.text || payload.message || JSON.stringify(payload);
    }

    const messageData = {
      event: SocketEvent.MESSAGE_RECEIVED,
      data: {
        text: messageText,
        userId: user.id,
        userName: user.fullName,
        timestamp: new Date(),
      },
    };

    this.logger.verbose(`Message from ${user.fullName}: ${messageText}`);

    // Barchaga yuborish
    this.broadcast(SocketEvent.MESSAGE_RECEIVED, messageData.data, client);
  }

  // Typing start
  @SubscribeMessage('typing_start')
  public handleTypingStart(client: WebSocket, payload: any): void {
    const clientData = this.clients.get(client);
    if (!clientData) return;

    this.broadcast(
      SocketEvent.TYPING_START,
      {
        userId: clientData.user.id,
        userName: clientData.user.fullName,
        roomId: payload.roomId,
      },
      client,
    );
  }

  // Typing stop
  @SubscribeMessage('typing_stop')
  public handleTypingStop(client: WebSocket, payload: any): void {
    const clientData = this.clients.get(client);
    if (!clientData) return;

    this.broadcast(
      SocketEvent.TYPING_STOP,
      {
        userId: clientData.user.id,
        roomId: payload.roomId,
      },
      client,
    );
  }

  // Room ga qo'shilish
  @SubscribeMessage('join_room')
  public handleJoinRoom(client: WebSocket, payload: { roomId: string }): void {
    this.joinRoom(client, payload.roomId);
    client.send(
      JSON.stringify({
        event: 'room_joined',
        roomId: payload.roomId,
      }),
    );
  }

  // Room dan chiqish
  @SubscribeMessage('leave_room')
  public handleLeaveRoom(client: WebSocket, payload: { roomId: string }): void {
    this.leaveRoom(client, payload.roomId);
    client.send(
      JSON.stringify({
        event: 'room_left',
        roomId: payload.roomId,
      }),
    );
  }

  // Room ga qo'shilish (private method)
  private joinRoom(client: WebSocket, roomId: string): void {
    const clientData = this.clients.get(client);
    if (!clientData) return;

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }

    this.rooms.get(roomId).add(client);
    clientData.rooms.add(roomId);

    this.logger.debug(`Client ${clientData.user.id} joined room: ${roomId}`);
  }

  // Room dan chiqish (private method)
  private leaveRoom(client: WebSocket, roomId: string): void {
    const clientData = this.clients.get(client);
    if (!clientData) return;

    const room = this.rooms.get(roomId);
    if (room) {
      room.delete(client);
      if (room.size === 0) {
        this.rooms.delete(roomId);
      }
    }

    clientData.rooms.delete(roomId);
    this.logger.debug(`Client ${clientData.user.id} left room: ${roomId}`);
  }

  // User ga xabar yuborish
  public sendToUser(userId: string, event: SocketEvent, data: any): void {
    const userSocketsSet = this.userSockets.get(userId);
    if (!userSocketsSet) {
      this.logger.warn(`User ${userId} is not connected`);
      return;
    }

    const message = JSON.stringify({ event, data });

    userSocketsSet.forEach((socket) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(message);
      }
    });
  }

  // Room ga xabar yuborish
  public sendToRoom(roomId: string, event: SocketEvent, data: any): void {
    const room = this.rooms.get(roomId);
    if (!room) {
      this.logger.warn(`Room ${roomId} does not exist`);
      return;
    }

    const message = JSON.stringify({ event, data });

    room.forEach((socket) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(message);
      }
    });
  }

  // Barchaga xabar yuborish (sender dan tashqari)
  public broadcast(event: SocketEvent, data: any, sender?: WebSocket): void {
    const message = JSON.stringify({ event, data });

    this.server.clients.forEach((client) => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (error) {
          this.logger.error(
            `Failed to send message to client: ${error.message}`,
          );
        }
      }
    });
  }

  // Hammaga xabar yuborish (sender ham)
  public emit(event: SocketEvent, data: any): void {
    const message = JSON.stringify({ event, data });

    this.server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Online userlar ro'yxati
  public getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  // Online userlar soni
  public getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  // Total connections
  public getTotalConnections(): number {
    return this.clients.size;
  }
}
