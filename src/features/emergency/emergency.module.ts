import { Module } from '@nestjs/common';
import { EmergencyService } from './service/emergency.service';
import { EmergencyController } from './emergency.controller';
import { PrismaService } from '../prisma/prisma.service';
import { EmergencyGateway } from '../websocket/emergency.gateway';
import { BullmqService } from '../shared/queues/bullMq';
import { FirebaseService } from '../notification/firebase.service';
import { DispatchService } from './service/dispatch.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    EmergencyGateway,
    EmergencyService,
    PrismaService,
    BullmqService,
    FirebaseService,
    DispatchService,
    JwtService,
    ConfigService,
  ],
  controllers: [EmergencyController],
  exports: [DispatchService],
})
export class EmergencyModule {}
