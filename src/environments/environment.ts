import { config } from 'dotenv';

config();

const { env } = process;

export const environments = {
  port: Number(env.PORT || 4000),
  emailHost: env.MAIL_HOST,
  emailUser: env.SMTP_USERNAME,
  emailPass: env.SMTP_PASSWORD,
  jwtSecret: env.JWT_SECRET,
  OTP_EXPIRATION_IN_SECONDS: 300,
  OTP_EXPIRATION_IN_MINUTES: 5,
  redis_host: env.REDIS_HOST,
  redis_port: env.REDIS_PORT,
};
