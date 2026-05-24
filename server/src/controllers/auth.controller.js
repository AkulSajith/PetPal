import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { hashPassword, verifyPassword } from '../services/password.service.js';
import { signToken } from '../services/token.service.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendCreated, toPublicUser } from '../utils/response.js';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(5),
    role: z.enum(['OWNER', 'CARETAKER', 'TRAINER', 'ADMIN']).default('OWNER'),
    location: z.string().min(2),
    pet: z.object({
      name: z.string().min(1),
      breed: z.string().min(1),
      age: z.coerce.number().int().nonnegative(),
      medicalNotes: z.string().optional().default(''),
    }).optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, location, pet } = req.validated.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, 'Email is already registered');

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: await hashPassword(password),
      role,
      location,
      city: location,
      petType: 'Dog',
      pets: pet ? {
        create: {
          name: pet.name,
          breed: pet.breed,
          age: pet.age,
          medicalNotes: pet.medicalNotes,
          type: 'Dog',
          weight: 10,
          size: 'Medium',
          temperament: 'Friendly',
          allergies: 'None',
          activityLevel: 'Moderate',
          budget: 'Moderate',
        },
      } : undefined,
    },
    include: { pets: true },
  });

  sendCreated(res, { user: toPublicUser(user), token: signToken(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await verifyPassword(password, user.password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  res.json({ data: { user: toPublicUser(user), token: signToken(user) } });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ data: { user: toPublicUser(req.user) } });
});
