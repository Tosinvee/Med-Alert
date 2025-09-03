import { Module } from '@nestjs/common';
import { RetryDispatchProcessor } from './queues/retry-dispatch.processor';
import { PrismaService } from '../prisma/prisma.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { FirebaseService } from '../notification/firebase.service';

@Module({
  providers: [
    RetryDispatchProcessor,
    PrismaService,
    WebsocketGateway,
    FirebaseService,
  ],
})
export class SharedModule {}
