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
import { Logger, NotFoundException } from '@nestjs/common';
import { CreateEmergencyDto } from '../../emergency/dto/create-emergency.dto';
import { ConfigService } from '@nestjs/config';
import { UserType } from '@prisma/client';
import {
  PresenceService,
  Role,
} from 'src/features/notification/presence.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EmergencyGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(EmergencyGateway.name);
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly dispatchService: DispatchService,
    private readonly configService: ConfigService,
    private readonly presenceService: PresenceService,
  ) {}

  private getRoom(role: UserType, id: number | string): string {
    return `${role}_${id}`;
  }

  async handleConnection(client: Socket) {
    console.log('New client trying to connect, socket id:', client.id);
    try {
      const token = client.handshake.auth?.token;

      if (!token) {
        this.logger.warn('Socket connection rejected: No token');
        return client.disconnect();
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow('JWT_SECRET'),
      });
      const userId = payload.sub;
      const userType = payload.role as UserType;

      //attach user to socket
      client.data.user = { userId, userType };

      const room = this.getRoom(userType, userId);
      await client.join(room);

      if (userType === UserType.MEDIC) {
        await this.presenceService.markOnline(String(userId), Role.MEDIC);
      }

      this.logger.log(`${userType} ${userId} connected | Socket: ${client.id}`);
    } catch (err) {
      this.logger.error(`Connection failed: ${err.message}`);
      client.disconnect();
    }
  }
  async handleDisconnect(client: Socket) {
    const user = client.data.user;

    if (!user) return;

    const { userId, userType } = user;

    if (userType === UserType.MEDIC) {
      await this.presenceService.markOffline(String(userId), Role.MEDIC);
    }

    this.logger.log(`${userType} ${userId} disconnected`);
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
