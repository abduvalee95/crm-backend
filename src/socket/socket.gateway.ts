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
import { Server } from 'ws';
import * as WebSocket from 'ws';
import { AuthService } from '../components/auth/auth.service';
import { User } from '../libs/entities/user';

interface MessagePayload {
	event: string;
	text: string;
	memberData: User;
}

interface InfoPayload {
	event: string;
	totalClients: number;
	memberData: User;
	action: string;
}

@WebSocketGateway()
export class SocketGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	private logger: Logger = new Logger('SocketEventsGateway');
	private summaryClient: number = 0;
	private clientsAuthMap = new Map<WebSocket, User>();
	private messagesList: MessagePayload[] = [];

	constructor(private authService: AuthService) {}

	@WebSocketServer()
	server: Server;

	public afterInit(server: Server) {
		this.logger.verbose(`WebSocket Server Initialized Total: [${this.summaryClient}]`);
	}

	//Tokendi Headerdan ovolamiz
	private async retrieveAuth(req: any): Promise<User> {
		try {
			const parseUrl = url.parse(req.url, true);
			const { token } = parseUrl.query;
			return await this.authService.verifyToken(token as string);
		} catch (error) {
			return null;
		}
	}

	//bunda serverga ulangan Clientlarni malumotni olishimiz mumkin
	public async handleConnection(client: WebSocket, req: any) {
		const authMember = await this.retrieveAuth(req);
		this.summaryClient++;
		this.clientsAuthMap.set(client, authMember);

		const clientNick: string = authMember?.fullName ?? 'Guest';
		this.logger.verbose(`~~~~ Clients Connetcted Total: [${this.summaryClient}] ~~~~`); 

		const infoMsg: InfoPayload = {
			event: 'info',
			totalClients: this.summaryClient,
			memberData: authMember,
			action: 'joined',
		};
		this.emitMessage(infoMsg);
		client.send(JSON.stringify({ event: 'getMessage', list: this.messagesList }));
	}
	// connection yoqolganda ishga tushadi
	public handleDisconnect(client: WebSocket) {
		const authMember = this.clientsAuthMap.get(client);
		this.summaryClient--;
		this.clientsAuthMap.delete(client);

		const clientNick: string = authMember?.fullName ?? 'Guest';
		this.logger.verbose(
			`~~~~ Disconnected Left [${clientNick} & Total: [${this.summaryClient}] ~~~~`,
		);

		const infoMsg: InfoPayload = {
			event: 'info',
			totalClients: this.summaryClient,
			memberData: authMember,
			action: 'left',
		};
		this.broadcastMessage(client, infoMsg);
	}

	@SubscribeMessage('message')
	public async handleMessage(client: WebSocket, payload: any): Promise<void> {
		const authMember = this.clientsAuthMap.get(client);
		const newMessage: MessagePayload = {
			event: 'message',
			text: payload,
			memberData: authMember,
		};

		const clientNick: string = authMember?.fullName ?? 'Guest';
		this.logger.verbose(`New Message [${clientNick}] :${payload}`);

		this.messagesList.push(newMessage);
		if (this.messagesList.length > 5)
			this.messagesList.splice(0, this.messagesList.length - 5); //eng ohirgi 5 ta messageni saqlemiz

		this.emitMessage(newMessage);
	}

	//* Murojatchidan tashqari Sendeerdan tashqari  hammaga message yuboradi
	private broadcastMessage(
		sender: WebSocket,
		message: InfoPayload | MessagePayload,
	) {
		this.server.clients.forEach((client) => {
			if (client !== sender && client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}

	// WebSocketga ulangan hamma clientga message yuboradi
	private emitMessage(message: InfoPayload | MessagePayload) {
		this.server.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}
}
