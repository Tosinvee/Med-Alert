import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { environments } from '../../environments/environment';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: environments.emailHost,
      auth: {
        user: environments.emailUser,
        pass: environments.emailPass,
      },
    });
  }

  async format(otp: string, content: string): Promise<string> {
    return `
      <div style="
        font-family: 'Raleway', sans-serif;
        max-width: 400px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f4f4f4;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      ">
        <h1 style="font-size: 24px; color: #333;">${content}</h1>
        <p style="font-size: 16px; color: #666;">Kindly use this OTP for verification.</p>
        <h1 style="font-size: 28px; color: #007bff;">${otp}</h1>
        <p style="font-size: 16px; color: #666;">It will expire in ${environments.OTP_EXPIRATION_IN_MINUTES} minutes.</p>
      </div>
    `;
  }

  async sendOtp(email: string, otp: string): Promise<void> {
    const html = await this.format(otp, 'OTP Verification');

    const mailOptions = {
      from: `Med Alert<${environments.emailUser}>`,
      to: email,
      subject: 'OTP Verification',
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to send OTP email');
    }
  }
}
