import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FirebaseService } from '../../notification/firebase.service';
import { CreateEmergencyDto } from '../dto/create-emergency.dto';
import { generateCustomId } from '../../shared/utils/generate-customId';
import { BullmqService } from '../../shared/queues/bullMq';

@Injectable()
export class EmergencyService {
  constructor(
    private prisma: PrismaService,
    private queue: BullmqService,
    private notifications: FirebaseService,
  ) {}

  async calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ) {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async createEmergency(userId: number, dto?: CreateEmergencyDto) {
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
        patientId: patient.id,
        type: dto.type,
        description: dto.description,
        locationLat: patient.user.latitude,
        locationLng: patient.user.longitude,
      },
      include: { patient: { include: { user: true } } },
    });
    return emergency;
  }

  async getTopNearestMedic(emergencyLat: number, emergencyLng: number) {
    const medics = await this.prisma.medic.findMany({
      where: {
        isAvailable: true,
        user: {
          latitude: { not: null },
          longitude: { not: null },
        },
      },
      include: { user: true },
    });

    if (!medics.length) throw new NotFoundException('No available medics');

    // Map to promises
    const medicDistances = await Promise.all(
      medics.map(async (medic) => ({
        medic,
        distance: await this.calculateDistance(
          emergencyLat,
          emergencyLng,
          medic.user.latitude!,
          medic.user.longitude!,
        ),
      })),
    );

    // Sort by distance
    medicDistances.sort((a, b) => a.distance - b.distance);

    // Return top 3
    return medicDistances.slice(0, 3).map((item) => item.medic);
  }
}
