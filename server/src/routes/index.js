import { Router } from 'express';
import authRoutes from './auth.routes.js';
import analyticsRoutes from './analytics.routes.js';
import bookingRoutes from './booking.routes.js';
import eventRoutes from './event.routes.js';
import notificationRoutes from './notification.routes.js';
import petRoutes from './pet.routes.js';
import recommendationRoutes from './recommendation.routes.js';
import reviewRoutes from './review.routes.js';
import subscriptionRoutes from './subscription.routes.js';
import trainerRoutes from './trainer.routes.js';
import vetRoutes from './vet.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/pets', petRoutes);
router.use('/bookings', bookingRoutes);
router.use('/trainers', trainerRoutes);
router.use('/vets', vetRoutes);
router.use('/events', eventRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);

export default router;
