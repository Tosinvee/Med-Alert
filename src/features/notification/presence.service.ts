import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

export enum Role {
  MEDIC = 'medic',
  AMBULANCE = 'ambulance',
}

@Injectable()
export class PresenceService {
  constructor(private readonly redis: RedisService) {}

  // -------------------- KEY HELPER --------------------
  private getKey(role: Role): string {
    return `online_${role.toLowerCase()}s`;
  }

  // -------------------- ONLINE --------------------
  // async markOnline(userId: string, role: Role) {
  //   await this.redis.sAdd(this.getKey(role), userId);
  // }

  async markOnline(medicId: string) {
    await this.redis.sAdd('online:medics', medicId);
  }

  // -------------------- OFFLINE --------------------
  // async markOffline(userId: string, role: Role) {
  //   const key = this.getKey(role);
  //   await this.redis.getClient().srem(key, userId);
  // }

  async markOffline(medicId: string) {
    await this.redis.sRem('online:medics', medicId);
  }

  // -------------------- CHECK --------------------
  async isOnline(userId: string, role: Role): Promise<boolean> {
    const members = await this.redis.sMembers(this.getKey(role));
    return members.includes(userId);
  }

  // -------------------- GET ALL --------------------
  async getOnline(role: Role): Promise<string[]> {
    return this.redis.sMembers(this.getKey(role));
  }

  // -------------------- LOCATION --------------------
  async updateLocation(medicId: string, lat: number, lng: number) {
    await this.redis.geoAdd('medics:locations', lng, lat, medicId);
  }

  // -------------------- FIND NEARBY --------------------
  async getNearby(lat: number, lng: number, radiusKm: number) {
    const nearbyIds = await this.redis.geoSearch(
      'medics:locations',
      lng,
      lat,
      radiusKm,
    );

    const onlineMedics: string[] = [];

    for (const medicId of nearbyIds) {
      const isOnline = await this.redis.sIsMember('online:medics', medicId);

      if (isOnline) {
        onlineMedics.push(medicId);
      }
    }

    return onlineMedics;
  }
}
