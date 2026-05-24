import { app } from '../app.js';
import { prisma } from '../prisma/client.js';

const server = app.listen(0);

function url(path) {
  const { port } = server.address();
  return `http://127.0.0.1:${port}${path}`;
}

async function expectStatus(path, expected, options = {}) {
  const response = await fetch(url(path), options);
  if (response.status !== expected) {
    throw new Error(`${path} expected ${expected}, received ${response.status}`);
  }
  return response;
}

try {
  await expectStatus('/api/health', 200);
  await expectStatus('/api/pets', 401);
  await expectStatus('/api/not-a-route', 404);
  console.log('PetPal smoke tests passed.');
} finally {
  server.close();
  await prisma.$disconnect();
}
