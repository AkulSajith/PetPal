import { Router } from 'express';
import { bookingSchema, createBooking, listBookings, updateBookingStatus } from '../controllers/booking.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);
router.get('/', listBookings);
router.post('/', validate(bookingSchema), createBooking);
router.patch('/:id/status', updateBookingStatus);

export default router;
