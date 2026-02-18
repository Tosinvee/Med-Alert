import { Module } from '@nestjs/common';
import { RetryDispatchProcessor } from './queues/retry-dispatch.processor';
import { PrismaService } from '../prisma/prisma.service';
import { EmergencyGateway } from '../websocket/emergency.gateway';
import { FirebaseService } from '../notification/firebase.service';
import { JwtService } from '@nestjs/jwt';
import { EmergencyModule } from '../emergency/emergency.module';

@Module({
  imports: [EmergencyModule],
  providers: [
    JwtService,
    RetryDispatchProcessor,
    PrismaService,
    FirebaseService,
    EmergencyGateway,
  ],
})
export class SharedModule {}
