import { Router } from 'express';
import { createTrainer, listTrainers, trainerSchema } from '../controllers/trainer.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', listTrainers);
router.post('/', authenticate, validate(trainerSchema), createTrainer);

export default router;
