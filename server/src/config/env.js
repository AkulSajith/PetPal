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
  OLLAMA_API_KEY: z.string().trim().min(1).optional(),
  OLLAMA_MODEL: z.string().trim().min(1).optional(),
  OLLAMA_BASE_URL: z.string().url().default('https://ollama.com/api'),
  OLLAMA_TIMEOUT_MS: z.coerce.number().int().min(1000).max(120000).default(30000),
  CHAT_HISTORY_MAX_MESSAGES: z.coerce.number().int().min(2).max(30).default(12),
  CHAT_MESSAGE_MAX_CHARS: z.coerce.number().int().min(100).max(10000).default(2000),
  CHAT_REQUEST_MAX_CHARS: z.coerce.number().int().min(500).max(50000).default(12000),
  CHAT_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1000).max(3600000).default(60000),
  CHAT_RATE_LIMIT_MAX: z.coerce.number().int().min(1).max(1000).default(12),
});

const parsed = envSchema.parse(process.env);

export const env = {
  ...parsed,
  corsOrigins: (parsed.CORS_ORIGINS || parsed.CLIENT_URL)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};
