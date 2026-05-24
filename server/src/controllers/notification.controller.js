import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendCreated } from '../utils/response.js';

export const notificationSchema = z.object({
  body: z.object({
    userId: z.coerce.number().int().positive().optional(),
    message: z.string().min(2),
    isRead: z.boolean().optional().default(false),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: req.user.role === 'ADMIN' ? {} : { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ data: notifications });
});

export const createNotification = asyncHandler(async (req, res) => {
  const notification = await prisma.notification.create({
    data: {
      userId: req.validated.body.userId || req.user.id,
      message: req.validated.body.message,
      isRead: req.validated.body.isRead,
    },
  });
  sendCreated(res, notification);
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const schema = z.object({ params: z.object({ id: z.coerce.number().int().positive() }) });
  const { params } = schema.parse({ params: req.params });
  const notification = await prisma.notification.update({
    where: { id: params.id },
    data: { isRead: true },
  });
  res.json({ data: notification });
});
