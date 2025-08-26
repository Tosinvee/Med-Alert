import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class WebsocketGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<number, string>();

  handleConnection(client: Socket) {
    const userId = parseInt(client.handshake.query.userId as string);
    if (userId) {
      this.userSockets.set(userId, client.id);
    }
  }

  sendToUser(userId: number, event: string, data: any) {
    const socketId = this.userSockets.get(userId);

    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }
}
