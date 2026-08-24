import express from 'express';
// Singular controller import for checkin operations//
import { checkinController } from '../controller/checkinController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/scan', authMiddleware.verifyKioskApiKey, checkinController.processScan);

export default router;
