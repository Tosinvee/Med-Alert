import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { EmergencyService } from './service/emergency.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreateEmergencyDto } from './dto/create-emergency.dto';
import { CurrentUser } from '../auth/decorator/current-user';
import { User } from '@prisma/client';
import { DispatchService } from './service/dispatch.service';

@Controller('emergency')
export class EmergencyController {
  constructor(
    private emergencyService: EmergencyService,
    private dispatchService: DispatchService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createEmergency(
    @CurrentUser() user: User,
    @Body() body: CreateEmergencyDto,
  ) {
    const { emergency, dispatches } =
      await this.dispatchService.handlePatientRequest(user.id, body);
    return { emergency, dispatches };
  }
}
