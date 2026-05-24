import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();
dotenv.config({ path: 'server/.env' });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(4000),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  CORS_ORIGINS: z.string().optional(),
  JWT_SECRET: z.string().min(16).default('dev-only-petpal-secret-change-me'),
  JWT_EXPIRES_IN: z.string().default('7d'),
});

const parsed = envSchema.parse(process.env);

export const env = {
  ...parsed,
  corsOrigins: (parsed.CORS_ORIGINS || parsed.CLIENT_URL)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};
