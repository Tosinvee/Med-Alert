import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import { UserService } from '../user/user.service';
import { hashPassword } from '../common/utils/hashed-password';
import { generateCustomId } from '../common/utils/generate-customId';
import { MailService } from '../mail/mail.service';
import { OtpService } from '../otp/otp.service';
import * as bcrypt from 'bcrypt';
import { TokenPayload } from './interface/token-payload.interface';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UserService,
    private mailService: MailService,
    private otpService: OtpService,
    private configService: ConfigService,
  ) {}

  async signup(body: SignupDto) {
    const { email, password, userType } = body;

    const existing = await this.userService.findUserByEmail(email);
    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await hashPassword(password);

    await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        userType,
        reference: generateCustomId('USR', 8),
      },
    });

    await this.startEmailVerification(email);

    return {
      success: true,
      message: `Otp sent to ${email}`,
    };
  }

  async startEmailVerification(email: string) {
    const { otp, hashedOtp, expiresAt } = await this.otpService.generateOtp();
    await this.prisma.$transaction([
      this.prisma.otp.deleteMany({
        where: {
          userEmail: email,
        },
      }),
      this.prisma.otp.create({
        data: {
          otp: hashedOtp,
          userEmail: email,
          expiresAt,
        },
      }),
    ]);
    await this.mailService.sendOtp(email, otp);
  }

  async verifyOtp(email: string, otp: string) {
    const isValidOtp = await this.otpService.verifyOtp(email, otp);
    if (isValidOtp) {
      const user = await this.prisma.user.update({
        where: { email },
        data: { email_verified: true },
      });
      return user;
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findUserByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      if (!user.email_verified) {
        await this.startEmailVerification(user.email);
        throw new BadRequestException('Email not verified, OTP sent to email');
      }
      return user;
    }
    return null;
  }

  async login(user: User) {
    const tokenPayload: TokenPayload = {
      sub: user.id.toString(),
      email: user.email,
      userType: user.userType,
    };
    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_EXPIRATION'),
    });
    return {
      accessToken,
    };
  }
}
