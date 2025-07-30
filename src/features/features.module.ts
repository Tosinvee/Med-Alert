import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { MailModule } from './mail/mail.module';
import { OtpModule } from './otp/otp.module';

@Module({
  imports: [UserModule, AuthModule, PrismaModule, CommonModule, MailModule, OtpModule],
})
export class FeaturesModule {}
