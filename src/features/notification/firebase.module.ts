import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [FirebaseService, PrismaService],
})
export class FirebaseModule {}
