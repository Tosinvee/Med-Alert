import { Module } from '@nestjs/common';
//import { RetryDispatchProcessor } from './queues/retry-dispatch.processor';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EmergencyModule } from '../emergency/emergency.module';

@Module({
  imports: [EmergencyModule],
  providers: [JwtService, PrismaService],
})
export class SharedModule {}
