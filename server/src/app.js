import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestId } from './middleware/requestId.js';
import routes from './routes/index.js';

export const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(requestId);
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by PetPal CORS policy'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (_req, res) => {
  res.json({ data: { status: 'ok', service: 'petpal-api' } });
});

app.get('/api/ready', async (_req, res, next) => {
  try {
    const { prisma } = await import('./prisma/client.js');
    await prisma.$queryRaw`SELECT 1`;
    res.json({ data: { status: 'ready' } });
  } catch (error) {
    next(error);
  }
});

app.use('/api', routes);
app.use(notFoundHandler);
app.use(errorHandler);
