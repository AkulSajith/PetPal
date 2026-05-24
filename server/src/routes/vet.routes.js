import { Router } from 'express';
import { createVet, listVets, vetSchema } from '../controllers/vet.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', listVets);
router.post('/', authenticate, authorize('ADMIN'), validate(vetSchema), createVet);

export default router;
