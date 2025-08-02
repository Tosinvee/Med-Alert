import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '../auth/decorator/current-user';
import { updateProfileDto } from './dto/update-profile.dto';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Put()
  @UseGuards(JwtAuthGuard)
  async updatePatientProfile(
    @Req() req: Request,
    @CurrentUser() user: User,
    @Body() body: updateProfileDto,
  ) {
    const userAgent = req.headers['user-agent'] || 'Unknown';
    return this.userService.updateProfile(user.id, body, userAgent);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: User) {
    return this.userService.getProfile(user.id);
  }
}
