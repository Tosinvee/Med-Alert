import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { SharedModule } from './shared/shared.module';
import { MailModule } from './mail/mail.module';
import { OtpModule } from './otp/otp.module';
import { EmergencyModule } from './emergency/emergency.module';
import { FirebaseModule } from './notification/firebase.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    PrismaModule,
    SharedModule,
    MailModule,
    OtpModule,
    EmergencyModule,
    FirebaseModule,
  ],
})
export class FeaturesModule {}
