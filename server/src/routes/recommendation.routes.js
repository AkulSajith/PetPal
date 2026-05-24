import { Router } from 'express';
import { caretakers, events, foodSuggestions, nearbyTrainers } from '../controllers/recommendation.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/nearby-trainers', nearbyTrainers);
router.get('/food-subscriptions', foodSuggestions);
router.get('/caretakers', caretakers);
router.get('/events', events);

export default router;
