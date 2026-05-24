import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendCreated } from '../utils/response.js';

export const eventSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    location: z.string().min(2),
    date: z.coerce.date(),
    description: z.string().min(5),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const listEvents = asyncHandler(async (_req, res) => {
  const events = await prisma.petEvent.findMany({ orderBy: { date: 'asc' } });
  res.json({ data: events });
});

export const createEvent = asyncHandler(async (req, res) => {
  const event = await prisma.petEvent.create({ data: req.validated.body });
  const users = await prisma.user.findMany({ where: { location: event.location }, select: { id: true } });
  if (users.length) {
    await prisma.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        message: `Upcoming event reminder: ${event.title} in ${event.location} on ${event.date.toISOString().slice(0, 10)}.`,
      })),
    });
  }
  sendCreated(res, event);
});
