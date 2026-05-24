import { Router } from 'express';
import { createNotification, listNotifications, markNotificationRead, notificationSchema } from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);
router.get('/', listNotifications);
router.post('/', validate(notificationSchema), createNotification);
router.patch('/:id/read', markNotificationRead);

export default router;
