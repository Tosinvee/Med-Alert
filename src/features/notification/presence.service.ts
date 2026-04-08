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
    return `online_${role.toLowerCase()}s`; // e.g. online_medics
  }

  // -------------------- ONLINE --------------------
  async markOnline(userId: string, role: Role) {
    await this.redis.sAdd(this.getKey(role), userId);
  }

  // -------------------- OFFLINE --------------------
  async markOffline(userId: string, role: Role) {
    const key = this.getKey(role);
    await this.redis.getClient().srem(key, userId); // using raw client (simple)
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
  async updateLocation(userId: string, lng: number, lat: number) {
    await this.redis.geoAdd('locations', lng, lat, userId);
  }

  // -------------------- FIND NEARBY --------------------
  async getNearby(
    lng: number,
    lat: number,
    radiusKm: number = 5,
  ): Promise<string[]> {
    return this.redis.geoRadius('locations', lng, lat, radiusKm);
  }
}
