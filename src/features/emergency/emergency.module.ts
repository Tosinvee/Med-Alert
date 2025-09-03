import { Module } from '@nestjs/common';
import { EmergencyService } from './emergency.service';
import { EmergencyController } from './emergency.controller';
import { PrismaService } from '../prisma/prisma.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { BullmqService } from '../shared/queues/bullMq';
import { FirebaseService } from '../notification/firebase.service';

@Module({
  providers: [
    EmergencyService,
    PrismaService,
    WebsocketGateway,
    BullmqService,
    FirebaseService,
  ],
  controllers: [EmergencyController],
})
export class EmergencyModule {}
