import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { RedisService } from '../redis/redis.service';
import { DispatchService } from '../emergency/service/dispatch.service';

@Processor('dispatch')
export class DispatchProcessor {
  constructor(
    private redisService: RedisService,
    private dispatchService: DispatchService,
  ) {}
  @Process('retry-dispatch')
  async retry(job: Job) {
    const { emergencyId } = job.data;

    const data = JSON.parse(
      await this.redisService.get(`dispatch:${emergencyId}`),
    );

    if (data.status === 'accepted') return;

    if (data.currentIndex >= data.medics.length) return;

    await this.dispatchService.startBatchDispatch(emergencyId);
  }
}
