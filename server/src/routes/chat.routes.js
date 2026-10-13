import { Router } from 'express';
import { chat, chatRequestSchema } from '../controllers/chat.controller.js';
import { chatRateLimit } from '../middleware/chatRateLimit.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post('/', chatRateLimit, validate(chatRequestSchema), chat);

export default router;
