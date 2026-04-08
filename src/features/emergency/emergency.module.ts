import { Module } from '@nestjs/common';
import { EmergencyService } from './service/emergency.service';
import { EmergencyController } from './emergency.controller';
import { PrismaService } from '../prisma/prisma.service';
import { EmergencyGateway } from '../websocket/gateways/emergency.gateway';
import { BullmqService } from '../shared/queues/bullMq';
import { DispatchService } from './service/dispatch.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PresenceService } from '../notification/presence.service';
import { RedisService } from '../redis/redis.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Module({
  providers: [
    EmergencyGateway,
    EmergencyService,
    PrismaService,
    BullmqService,
    DispatchService,
    JwtService,
    ConfigService,
    PresenceService,
    RedisService,
    EventEmitter2,
  ],
  controllers: [EmergencyController],
  exports: [DispatchService],
})
export class EmergencyModule {}
