import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/features/prisma/prisma.service';
import { EmergencyService } from './emergency.service';
import { CreateEmergencyDto } from '../dto/create-emergency.dto';

@Injectable()
export class DispatchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emergencyService: EmergencyService,
  ) {}

  async handlePatientRequest(patientUserId: number, body?: CreateEmergencyDto) {
    const emergency = await this.emergencyService.createEmergency(
      patientUserId,
      body,
    );

    const medics = await this.emergencyService.getTopNearestMedic(
      emergency.locationLat,
      emergency.locationLng,
    );

    const dispatches = [];

    for (const medic of medics) {
      const dispatch = await this.prisma.dispatch.create({
        data: {
          emergencyId: emergency.id,
          medicId: medic.id,
          status: 'PENDING',
        },
      });
      dispatches.push({ dispatch, medic });
    }
    return { emergency, dispatches };
  }
}
