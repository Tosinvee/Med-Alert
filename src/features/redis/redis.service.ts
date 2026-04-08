import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis();
  }

  async set(key: string, value: string) {
    await this.client.set(key, value);
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async sAdd(key: string, value: string) {
    await this.client.sadd(key, value);
  }

  async sRem(key: string, member: string) {
    await this.client.srem(key, member);
  }

  async sMembers(key: string) {
    return this.client.smembers(key);
  }
  async sIsMember(key: string, member: string): Promise<boolean> {
    return (await this.client.sismember(key, member)) === 1;
  }

  //save location
  async geoAdd(key: string, lng: number, lat: number, member: string) {
    await this.client.geoadd(key, lng, lat, member);
  }
  //Get location
  async getPos(key: string, member: string) {
    return this.client.geopos(key, member);
  }

  //Find nearby users
  async geoRadius(
    key: string,
    lng: number,
    lat: number,
    radius: number,
  ): Promise<string[]> {
    const result = await this.client.georadius(key, lng, lat, radius, 'km');
    return result.map((id) => String(id));
  }

  getClient() {
    return this.client;
  }
}
