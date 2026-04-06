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
import { DispatchService } from '../../emergency/service/dispatch.service';
import { NotFoundException } from '@nestjs/common';
import { CreateEmergencyDto } from '../../emergency/dto/create-emergency.dto';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EmergencyGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly dispatchService: DispatchService,
    private readonly configService: ConfigService,
  ) {}

  // private userSockets = new Map<number, string>();

  async handleConnection(client: Socket) {
    console.log('New client trying to connect, socket id:', client.id);
    try {
      const { token } = client.handshake.auth;
      console.log('Handshake auth token:', token);

      if (!token) throw new NotFoundException('Token not found');

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow('JWT_SECRET'),
      });
      const userId = payload.sub;
      client.data.userId = userId;
      client.join(`user_${userId}`);
      console.log(`User ${userId} joined room user_${userId}`);
    } catch (err) {
      console.log(' Connection failed:', err.message);
      client.disconnect();
    }
  }
  async handleDisconnect(client: Socket) {
    const userId = client.data.userId ?? 'unknown';
    console.log(`User ${userId} disconnected. Socket ID: ${client.id}`);
  }

  @SubscribeMessage('service_request')
  async handleServiceRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto?: CreateEmergencyDto,
  ) {
    const userId = client.data.userId;
    console.log(`Received service request from user ${userId}`);

    const { emergency, dispatches } =
      await this.dispatchService.handlePatientRequest(userId, dto);

    //  Notify medics here
    for (const item of dispatches) {
      console.log(`Sending emergency to medic ${item.medic.userId}`);
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
    const medicId = client.data.userId;
    console.log(
      `Medic ${medicId} is trying to accept dispatch ${payload.dispatchId}`,
    );
    const result = await this.dispatchService.acceptEmergency(
      payload.dispatchId,
      medicId,
    );
    console.log(' Dispatch accepted result:', result);
    this.server
      .to(`user_${result.patientId}`)
      .emit('emergency_accepted', result);
  }

  notifyUser(userId: number, event: string, payload: any) {
    this.server.to(`user${userId}`).emit(event, payload);
  }

  // sendToUser(userId: number, event: string, data: any) {
  //   const socketId = this.userSockets.get(userId);

  //   if (socketId) {
  //     this.server.to(socketId).emit(event, data);
  //   }
}
