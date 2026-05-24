import { app } from '../app.js';
import { prisma } from '../prisma/client.js';

const server = app.listen(0);

function url(path) {
  const { port } = server.address();
  return `http://127.0.0.1:${port}${path}`;
}

async function request(path, options = {}) {
  const response = await fetch(url(path), {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${path} failed: ${response.status} ${text}`);
  }
  return body;
}

try {
  await request('/api/health');
  await request('/api/ready');

  const login = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@petpal.com', password: 'password123' }),
  });

  const auth = { Authorization: `Bearer ${login.data.token}` };

  await request('/api/pets', { headers: auth });
  await request('/api/trainers');
  await request('/api/vets');
  await request('/api/events');
  await request('/api/analytics/dashboard', { headers: auth });
  await request('/api/recommendations/nearby-trainers', { headers: auth });
  await request('/api/notifications', { headers: auth });

  await request('/api/bookings', {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      petId: 1,
      serviceType: 'BOARDING',
      bookingDate: '2026-09-15',
      amount: 1400,
    }),
  });

  await request('/api/reviews', {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      targetType: 'TRAINER',
      targetId: 1,
      rating: 5,
      comment: 'Excellent structured pet training.',
    }),
  });

  console.log('PetPal DB-backed API E2E tests passed.');
} finally {
  server.close();
  await prisma.$disconnect();
}
