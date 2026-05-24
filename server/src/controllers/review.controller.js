import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendCreated } from '../utils/response.js';

export const reviewSchema = z.object({
  body: z.object({
    targetType: z.enum(['TRAINER', 'CARETAKER']),
    targetId: z.coerce.number().int().positive(),
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().min(2),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const listReviews = asyncHandler(async (req, res) => {
  const targetType = req.query.targetType?.toString();
  const targetId = req.query.targetId ? Number(req.query.targetId) : undefined;

  const reviews = await prisma.ratingReview.findMany({
    where: {
      ...(targetType ? { targetType } : {}),
      ...(targetId ? { targetId } : {}),
    },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const averageRating = reviews.length
    ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(2))
    : 0;

  res.json({ data: { averageRating, count: reviews.length, reviews } });
});

export const createReview = asyncHandler(async (req, res) => {
  const review = await prisma.ratingReview.create({
    data: {
      ...req.validated.body,
      userId: req.user.id,
    },
  });
  sendCreated(res, review);
});
