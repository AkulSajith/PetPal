import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendCreated } from '../utils/response.js';

export const petSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    breed: z.string().min(1),
    age: z.coerce.number().int().nonnegative(),
    medicalNotes: z.string().optional().default(''),
    type: z.string().optional().default('Dog'),
    weight: z.coerce.number().optional().default(10),
    size: z.string().optional().default('Medium'),
    temperament: z.string().optional().default('Friendly'),
    allergies: z.string().optional().default('None'),
    activityLevel: z.string().optional().default('Moderate'),
    budget: z.string().optional().default('Moderate'),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const listPets = asyncHandler(async (req, res) => {
  const where = req.user.role === 'ADMIN' ? {} : { ownerId: req.user.id };
  const pets = await prisma.pet.findMany({ where, orderBy: { id: 'asc' } });
  res.json({ data: pets });
});

export const createPet = asyncHandler(async (req, res) => {
  const pet = await prisma.pet.create({
    data: {
      ...req.validated.body,
      ownerId: req.user.id,
    },
  });
  sendCreated(res, pet);
});

export const getPet = asyncHandler(async (req, res) => {
  const pet = await prisma.pet.findUnique({ where: { id: req.validated.params.id } });
  if (!pet) throw new ApiError(404, 'Pet not found');
  if (req.user.role !== 'ADMIN' && pet.ownerId !== req.user.id) throw new ApiError(403, 'Pet access denied');
  res.json({ data: pet });
});

export const updatePet = asyncHandler(async (req, res) => {
  const existing = await prisma.pet.findUnique({ where: { id: req.validated.params.id } });
  if (!existing) throw new ApiError(404, 'Pet not found');
  if (req.user.role !== 'ADMIN' && existing.ownerId !== req.user.id) throw new ApiError(403, 'Pet access denied');

  const pet = await prisma.pet.update({ where: { id: req.validated.params.id }, data: req.body });
  res.json({ data: pet });
});

export const deletePet = asyncHandler(async (req, res) => {
  const pet = await prisma.pet.findUnique({ where: { id: req.validated.params.id } });
  if (!pet) throw new ApiError(404, 'Pet not found');
  if (req.user.role !== 'ADMIN' && pet.ownerId !== req.user.id) throw new ApiError(403, 'Pet access denied');
  await prisma.pet.delete({ where: { id: pet.id } });
  res.status(204).send();
});
