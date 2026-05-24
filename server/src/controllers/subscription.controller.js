import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendCreated } from '../utils/response.js';

export const subscriptionSchema = z.object({
  body: z.object({
    petId: z.coerce.number().int().positive(),
    foodType: z.string().min(2),
    deliveryFrequency: z.string().min(2),
    customization: z.string().min(1),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const listSubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await prisma.petFoodSubscription.findMany({
    where: req.user.role === 'ADMIN' ? {} : { pet: { ownerId: req.user.id } },
    include: { pet: true },
    orderBy: { id: 'desc' },
  });
  res.json({ data: subscriptions });
});

export const createSubscription = asyncHandler(async (req, res) => {
  const pet = await prisma.pet.findUnique({ where: { id: req.validated.body.petId } });
  if (!pet) throw new ApiError(404, 'Pet not found');
  if (req.user.role !== 'ADMIN' && pet.ownerId !== req.user.id) throw new ApiError(403, 'Pet access denied');

  const subscription = await prisma.petFoodSubscription.create({ data: req.validated.body });
  await prisma.notification.create({
    data: {
      userId: req.user.id,
      message: `Subscription renewal reminder: ${subscription.foodType} ships ${subscription.deliveryFrequency}.`,
      isRead: false,
    },
  });
  sendCreated(res, subscription);
});
