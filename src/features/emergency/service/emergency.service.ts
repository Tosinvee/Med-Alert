import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmergencyDto } from '../dto/create-emergency.dto';
import { generateCustomId } from '../../shared/utils/generate-customId';
import { BullmqService } from '../../shared/queues/bullMq';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EmergencyService {
  constructor(
    private prisma: PrismaService,
    private queue: BullmqService,
    private eventEmitter: EventEmitter2,
  ) {}

  async createEmergency(userId: number, dto: CreateEmergencyDto) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
      include: { user: true },
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    const emergency = await this.prisma.emergency.create({
      data: {
        reference: generateCustomId('EMR', 8),
        patientId: userId,
        type: dto.type,
        description: dto.description,
        locationLat: dto.latitude,
        locationLng: dto.longitude,
      },
      include: { patient: { include: { user: true } } },
    });
    this.eventEmitter.emit('emergency.created', emergency);
    return emergency;
  }
}
