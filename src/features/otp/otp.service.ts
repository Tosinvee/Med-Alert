import * as bcrypt from 'bcrypt';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OtpService {
  constructor(private prisma: PrismaService) {}

  async generateOtp(): Promise<{
    otp: string;
    hashedOtp: string;
    expiresAt: Date;
  }> {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    return { otp, hashedOtp, expiresAt };
  }

  async verifyOtp(email: string, submittedOtp: string): Promise<boolean> {
    const otpRecord = await this.prisma.otp.findFirst({
      where: {
        userEmail: email,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const isValid = await bcrypt.compare(submittedOtp, otpRecord.otp);

    if (!isValid) {
      throw new BadRequestException('Invalid OTP');
    }

    return true;
  }

  //will run a cron job to delete otp that has lasted for 7days in the database
}
