import { Router } from 'express';
import { createPet, deletePet, getPet, idParamSchema, listPets, petSchema, updatePet } from '../controllers/pet.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);
router.get('/', listPets);
router.post('/', validate(petSchema), createPet);
router.get('/:id', validate(idParamSchema), getPet);
router.patch('/:id', validate(idParamSchema), updatePet);
router.delete('/:id', validate(idParamSchema), deletePet);

export default router;
