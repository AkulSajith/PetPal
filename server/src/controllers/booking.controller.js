import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendCreated } from '../utils/response.js';

export const bookingSchema = z.object({
  body: z.object({
    petId: z.coerce.number().int().positive(),
    serviceType: z.string().min(2),
    providerId: z.coerce.number().int().positive().optional(),
    bookingDate: z.coerce.date(),
    status: z.string().optional().default('CONFIRMED'),
    amount: z.coerce.number().int().nonnegative().optional().default(0),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const listBookings = asyncHandler(async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: req.user.role === 'ADMIN' ? {} : { userId: req.user.id },
    include: { pet: true },
    orderBy: { bookingDate: 'desc' },
  });
  res.json({ data: bookings });
});

export const createBooking = asyncHandler(async (req, res) => {
  const { petId, serviceType, providerId, bookingDate, status, amount } = req.validated.body;
  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet) throw new ApiError(404, 'Pet not found');
  if (req.user.role !== 'ADMIN' && pet.ownerId !== req.user.id) throw new ApiError(403, 'Pet access denied');

  const booking = await prisma.booking.create({
    data: {
      userId: req.user.id,
      petId,
      serviceType,
      providerId,
      bookingDate,
      status,
      amount,
    },
  });

  await prisma.notification.create({
    data: {
      userId: req.user.id,
      message: `Booking confirmed for ${serviceType} on ${bookingDate.toISOString().slice(0, 10)}.`,
      isRead: false,
    },
  });

  sendCreated(res, booking);
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const schema = z.object({
    params: z.object({ id: z.coerce.number().int().positive() }),
    body: z.object({ status: z.string().min(2) }),
    query: z.object({}).optional(),
  });
  const parsed = schema.parse({ params: req.params, body: req.body, query: req.query });
  const booking = await prisma.booking.findUnique({ where: { id: parsed.params.id } });
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (req.user.role !== 'ADMIN' && booking.userId !== req.user.id) throw new ApiError(403, 'Booking access denied');

  res.json({ data: await prisma.booking.update({ where: { id: booking.id }, data: { status: parsed.body.status } }) });
});
