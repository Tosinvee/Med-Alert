import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';

export enum Role {
  MEDIC = 'medic',
  AMBULANCE = 'ambulance',
}
@Injectable()
export class PresenseService {
  constructor(private redis: RedisService) {}

  private getKey(role: Role): string {
    return `online_${role}s`;
  }

  async markOnline(userId: string, role: Role) {
    const key = this.getKey(role);
    await this.redis.sAdd(key, userId);
  }

  async markOffline(userId: string, role: Role) {
    const key = this.getKey(role);
    await this.redis.sRem(key, userId);
  }
  async getOnline(role: Role): Promise<string[]> {
    const key = this.getKey(role);
    return await this.redis.sMembers(key);
  }

  async updateLocation(userId: string, lng: number, lat: number) {
    await this.redis.geoAdd('locations', lng, lat, userId);
  }
}
