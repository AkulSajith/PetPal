import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './prisma/client.js';

const server = app.listen(env.PORT, () => {
  console.log(`PetPal API running on http://localhost:${env.PORT}`);
});

async function shutdown(signal) {
  console.log(`${signal} received. Closing PetPal API.`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
