import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async acceptEmergency(dispatchId: number, medicId: number) {
    return this.prisma.$transaction(async (tx) => {
      const dispatch = await tx.dispatch.findUnique({
        where: { id: dispatchId },
        include: { emergency: true, medic: true },
      });
      if (!dispatch) throw new NotFoundException('Dispatch not found');

      // if (dispatch.medic.userId !== medicId) {
      //   throw new BadRequestException('This dispatch does not belong to you');
      // }

      if (dispatch.status !== 'PENDING') {
        throw new BadRequestException('Emergency already accepted');
      }
      //  Update the current dispatch to ASSIGNED
      const updatedDispatch = await tx.dispatch.update({
        where: { id: dispatchId },
        data: {
          status: 'ACCEPTED', // Assign the medic
          respondedAt: new Date(),
        },
      });

      //  Cancel all other dispatches for the same emergency
      await tx.dispatch.updateMany({
        where: {
          emergencyId: dispatch.emergencyId,
          id: { not: dispatchId },
        },
        data: { status: 'CANCELLED' },
      });
      return {
        emergency: dispatch.emergency,
        patientId: dispatch.emergency.patientId,
        dispatchStatus: updatedDispatch.status,
      };
    });
  }
}
