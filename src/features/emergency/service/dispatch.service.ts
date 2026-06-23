import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/features/prisma/prisma.service';
import { RedisService } from 'src/features/redis/redis.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class DispatchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly eventEmitter: EventEmitter2,

    @InjectQueue('dispatch')
    private readonly queue: Queue,
  ) {}

  async startBatchDispatch(emergencyId: number) {
    const dispatch = await this.redisService.get(`dispatch:${emergencyId}`);

    if (!dispatch) {
      throw new Error('Dispatch state not found');
    }

    const data = JSON.parse(dispatch);

    const batch = data.medics.slice(data.currentIndex, data.currentIndex + 3);

    for (const medicId of batch) {
      const dispatch = await this.prisma.dispatch.create({
        data: {
          emergencyId,
          medicId: Number(medicId),
          status: 'PENDING',
        },
      });

      this.eventEmitter.emit('dispatch.created', {
        dispatchId: dispatch.id,
        emergencyId,
        medicId,
      });
    }

    data.currentIndex += batch.length;

    await this.redisService.set(
      `dispatch:${emergencyId}`,
      JSON.stringify(data),
    );

    await this.queue.add('retry-dispatch', { emergencyId }, { delay: 15000 });
  }
}
