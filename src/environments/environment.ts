import { config } from 'dotenv';

config();

const { env } = process;

export const environments = {
  port: Number(env.PORT || 5000),
};
