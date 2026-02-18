import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DispatchService } from '../emergency/service/dispatch.service';
import { NotFoundException } from '@nestjs/common';
import { CreateEmergencyDto } from '../emergency/dto/create-emergency.dto';

@WebSocketGateway({ cors: true })
export class EmergencyGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly dispatchService: DispatchService,
  ) {}

  // private userSockets = new Map<number, string>();

  async handleConnection(client: Socket) {
    try {
      const { token } = client.handshake.auth;
      if (!token) throw new NotFoundException('Token not found');
      const payload = await this.jwtService.verifyAsync(token);
      client.data.userId = payload.userId;
      client.join(`user_${payload.userId}`);
      console.log(`User${payload.userId} connecteds`);
    } catch (err) {
      client.disconnect;
    }
  }

  async handleDisconnect(client: Socket) {
    console.log(`User${client.data.userId} disconnected`);
  }

  @SubscribeMessage('service_request')
  async handleServiceRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto?: CreateEmergencyDto,
  ) {
    const userId = client.data.userId;

    const { emergency, dispatches } =
      await this.dispatchService.handlePatientRequest(userId, dto);

    // 🔔 Notify medics here
    for (const item of dispatches) {
      this.server
        .to(`user_${item.medic.userId}`)
        .emit('new_emergency', emergency);
    }

    return { message: 'Emergency sent to nearest medics' };
  }
  @SubscribeMessage('accept_emergency')
  async handleAccept(
    @MessageBody() payload: { dispatchId: number },
    @ConnectedSocket() client: Socket,
  ) {
    // const medicId = client.data.userId
    // await this.dispatchService.
  }

  notifyUser(userId: number, event: string, payload: any) {
    this.server.to(`user${userId}`).emit(event, payload);
  }
  //   const userId = parseInt(client.handshake.query.userId as string);
  //   if (userId) {
  //     this.userSockets.set(userId, client.id);
  //   }
  // }

  // sendToUser(userId: number, event: string, data: any) {
  //   const socketId = this.userSockets.get(userId);

  //   if (socketId) {
  //     this.server.to(socketId).emit(event, data);
  //   }
}
