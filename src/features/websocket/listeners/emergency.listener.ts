import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Emergency } from '@prisma/client';
import { PresenceService } from 'src/features/notification/presence.service';
import { RedisService } from 'src/features/redis/redis.service';
import { EmergencyGateway } from '../gateways/emergency.gateway';
import { DispatchService } from 'src/features/emergency/service/dispatch.service';

@Injectable()
export class EmergencyListener {
  constructor(
    private readonly dispatchService: DispatchService,
    private presenceService: PresenceService,
    private redisService: RedisService,
    private readonly gateway: EmergencyGateway,
  ) {}

  @OnEvent('emergency.created')
  async handleEmergency(emergency: Emergency) {
    const nearbyMedics = await this.presenceService.getNearby(
      emergency.locationLat,
      emergency.locationLng,
      15,
    );
    await this.redisService.set(
      `dispatch:${emergency.id}`,
      JSON.stringify({
        medics: nearbyMedics,
        currentIndex: 0,
        status: 'pending',
      }),
    );
    await this.dispatchService.startBatchDispatch(emergency.id);
  }

  @OnEvent('dispatch.created')
  async handleDispatchCreated(payload: {
    dispatchId: number;
    emergencyId: number;
    medicId: string;
  }) {
    this.gateway.server.to(`medic_${payload.medicId}`).emit('new_emergency', {
      dispatchId: payload.dispatchId,
      emergencyId: payload.emergencyId,
    });
  }
}
