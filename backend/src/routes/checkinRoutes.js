import express from 'express';
// Fixed path: points to singular 'controller' instead of 'controllers'
import { checkinController } from '../controller/checkinController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/scan', authMiddleware.verifyKioskApiKey, checkinController.processScan);

export default router;
