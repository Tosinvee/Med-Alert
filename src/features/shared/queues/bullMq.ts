import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class BullmqService {
  private retryQueue: Queue;

  constructor() {
    this.retryQueue = new Queue('retry-dispatch', {
      connection: { host: 'localhost', port: 6379 },
    });
  }

  async addJob(name: string, data: any, options?: any) {
    return this.retryQueue.add(name, data, options);
  }

  async cancelRetryJobs(emergencyId: number) {
    const jobs = await this.retryQueue.getDelayed();
    for (const job of jobs) {
      if (job.data.emergencyId === emergencyId) {
        await job.remove();
      }
    }
  }
}
