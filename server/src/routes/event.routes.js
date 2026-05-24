import { Router } from 'express';
import { createEvent, eventSchema, listEvents } from '../controllers/event.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', listEvents);
router.post('/', authenticate, authorize('ADMIN'), validate(eventSchema), createEvent);

export default router;
