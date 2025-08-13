import { Module } from '@nestjs/common';
import { AlertsGateWay } from './alert.gateway';

@Module({
  providers: [AlertsGateWay],
})
export class AlertModule {}
