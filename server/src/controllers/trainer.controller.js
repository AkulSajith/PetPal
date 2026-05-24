import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendCreated } from '../utils/response.js';

export const trainerSchema = z.object({
  body: z.object({
    userId: z.coerce.number().int().positive().optional(),
    specialization: z.string().min(2),
    experience: z.coerce.number().int().nonnegative(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const listTrainers = asyncHandler(async (_req, res) => {
  const trainers = await prisma.trainer.findMany({
    include: { user: { select: { id: true, name: true, email: true, location: true, role: true } } },
    orderBy: { id: 'asc' },
  });
  res.json({ data: trainers });
});

export const createTrainer = asyncHandler(async (req, res) => {
  const trainer = await prisma.trainer.create({
    data: {
      userId: req.validated.body.userId || req.user.id,
      specialization: req.validated.body.specialization,
      experience: req.validated.body.experience,
    },
  });
  sendCreated(res, trainer);
});
