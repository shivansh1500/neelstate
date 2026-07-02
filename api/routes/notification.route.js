import express from 'express';
import { getUserNotifications, markAsRead } from '../controllers/notification.controller.js';
import verifyToken from '../utils/verifyUser.js';

const router = express.Router();

router.get('/', verifyToken, getUserNotifications);
router.put('/:id/read', verifyToken, markAsRead);

export default router;
