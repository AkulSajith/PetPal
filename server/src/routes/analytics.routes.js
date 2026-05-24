import { Router } from 'express';
import {
  activeSubscriptions,
  adminDashboard,
  bookingTrends,
  dashboardSummary,
  insights,
  monthlyRegistrations,
  mostRequestedServices,
  petTypeDistribution,
  revenueEstimation,
} from '../controllers/analytics.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/dashboard', authorize('ADMIN'), adminDashboard);
router.get('/summary', authorize('ADMIN'), dashboardSummary);
router.get('/booking-trends', authorize('ADMIN'), bookingTrends);
router.get('/most-requested-services', authorize('ADMIN'), mostRequestedServices);
router.get('/monthly-registrations', authorize('ADMIN'), monthlyRegistrations);
router.get('/pet-type-distribution', authorize('ADMIN'), petTypeDistribution);
router.get('/revenue-estimation', authorize('ADMIN'), revenueEstimation);
router.get('/active-subscriptions', authorize('ADMIN'), activeSubscriptions);
router.get('/insights', authorize('ADMIN'), insights);

export default router;
