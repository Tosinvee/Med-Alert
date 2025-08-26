import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseService } from '../notification/firebase.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { CreateEmergencyDto } from './dto/create-emergency.dto';
import { generateCustomId } from '../shared/utils/generate-customId';
import { BullmqService } from '../shared/events/bullMq';

@Injectable()
export class EmergencyService {
  constructor(
    private prisma: PrismaService,
    private queue: BullmqService,
    private notifications: FirebaseService,
    private ws: WebsocketGateway,
  ) {}

  async createEmergency(userId: number, dto: CreateEmergencyDto) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
      include: { user: true },
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const medic = await this.prisma.medic.findFirst({
      where: { isAvailable: true },
      include: { user: { include: { deviceTokens: true } } },
    });
    if (!medic) {
      throw new NotFoundException('No available Medics');
    }
    const emergency = await this.prisma.emergency.create({
      data: {
        reference: generateCustomId('EMR', 8),
        type: dto.type,
        description: dto.description,
        locationLat: patient.user.latitude,
        locationLng: patient.user.longitude,
        patient: {
          connect: { id: patient.id },
        },
        dispatches: {
          create: {
            medicId: medic.id,
            status: 'PENDING',
          },
        },
      },
      include: { dispatches: true, patient: { include: { user: true } } },
    });

    await this.ws.sendToUser(
      medic.userId,
      'newDispatch',
      emergency.dispatches[0],
    );
    await this.notifications.sendToUser(medic.userId, {
      notification: {
        title: 'New Emergency',
        body: 'Please respond immediately',
      },
    });

    await this.queue.addJob(
      'retry-dispatch',
      { emergencyId: emergency.id },
      { delay: 30_000 },
    );
  }
}
