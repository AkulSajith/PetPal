import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendCreated } from '../utils/response.js';

export const vetSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    clinic: z.string().min(2),
    location: z.string().min(2),
    contact: z.string().min(5),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const listVets = asyncHandler(async (_req, res) => {
  const vets = await prisma.vet.findMany({ orderBy: { id: 'asc' } });
  res.json({ data: vets });
});

export const createVet = asyncHandler(async (req, res) => {
  const vet = await prisma.vet.create({ data: req.validated.body });
  sendCreated(res, vet);
});
