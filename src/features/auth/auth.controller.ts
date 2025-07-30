import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LocalAuthGuard } from './guards/local.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: SignupDto) {
    return this.authService.signup(body);
  }

  @Post('/verify-otp')
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    return await this.authService.verifyOtp(body.email, body.otp);
  }

  @Post('signin')
  @UseGuards(LocalAuthGuard)
  async signin(@Request() req: any) {
    return this.authService.login(req.user);
  }
}
