import { Injectable } from '@nestjs/common';
import { SocketEvent } from '../libs/enums/socket-event.enum';
import { SocketGateway } from './socket.gateway';

export interface NotificationPayload {
  id: string;
  type: string;
  message: string;
  userId: string;
  data?: any;
  createdAt: Date;
}

export interface DealUpdatePayload {
  id: string;
  title: string;
  stage: string;
  amount: number;
  clientId: string;
  assignedToId?: string;
  updatedBy: string;
}

export interface ClientUpdatePayload {
  id: string;
  name: string;
  email: string;
  status: string;
  createdById: string;
}

@Injectable()
export class SocketService {
  constructor(private socketGateway: SocketGateway) {}

  // Notification yuborish
  sendNotification(userId: string, payload: NotificationPayload) {
    this.socketGateway.sendToUser(userId, SocketEvent.NOTIFICATION, payload);
  }

  // Deal yangilanishini barchaga yuborish
  broadcastDealUpdate(payload: DealUpdatePayload) {
    this.socketGateway.broadcast(SocketEvent.DEAL_UPDATED, payload);
  }

  // Deal yaratilganini barchaga yuborish
  broadcastDealCreated(payload: DealUpdatePayload) {
    this.socketGateway.broadcast(SocketEvent.DEAL_CREATED, payload);
  }

  // Client yangilanishini barchaga yuborish
  broadcastClientUpdate(payload: ClientUpdatePayload) {
    this.socketGateway.broadcast(SocketEvent.CLIENT_UPDATED, payload);
  }

  // User online/offline status
  notifyUserStatus(userId: string, isOnline: boolean) {
    this.socketGateway.broadcast(
      isOnline ? SocketEvent.USER_ONLINE : SocketEvent.USER_OFFLINE,
      { userId, isOnline },
    );
  }

  // Room ga xabar yuborish (masalan, bitta deal yoki client uchun)
  sendToRoom(roomId: string, event: SocketEvent, payload: any) {
    this.socketGateway.sendToRoom(roomId, event, payload);
  }
}
