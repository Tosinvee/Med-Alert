import { Module } from '@nestjs/common';
import { RetryDispatchProcessor } from './queues/retry-dispatch.processor';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EmergencyModule } from '../emergency/emergency.module';
import { FirebaseService } from '../notification/firebase.service';

@Module({
  imports: [EmergencyModule],
  providers: [
    JwtService,
    RetryDispatchProcessor,
    PrismaService,
    FirebaseService,
  ],
})
export class SharedModule {}
