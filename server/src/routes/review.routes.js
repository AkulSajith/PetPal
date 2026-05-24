import { Router } from 'express';
import { createReview, listReviews, reviewSchema } from '../controllers/review.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', listReviews);
router.post('/', authenticate, validate(reviewSchema), createReview);

export default router;
