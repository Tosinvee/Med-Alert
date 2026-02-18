import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class PresenseService {
  private redis = new Redis();

  async markActive(userId: string, deviceId: string) {
    await this.redis.set(`online:${userId}:${deviceId}`, '1');
  }

  async markInActive(userId: string, deviceId: string) {
    await this.redis.del(`online:${userId}:${deviceId}`);
  }
  async isUserOnLine(userId: string) {
    const keys = await this.redis.keys(`online:${userId}:*`);
    return keys.length > 0;
  }
}
