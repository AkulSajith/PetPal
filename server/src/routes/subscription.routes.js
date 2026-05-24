import { Router } from 'express';
import { createSubscription, listSubscriptions, subscriptionSchema } from '../controllers/subscription.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);
router.get('/', listSubscriptions);
router.post('/', validate(subscriptionSchema), createSubscription);

export default router;
