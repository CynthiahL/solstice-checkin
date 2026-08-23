import express from 'express';
// Fixed path: points to singular 'controller' instead of 'controllers'
import { webhookController } from '../controller/webhookController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/printer', authMiddleware.verifyWebhookSignature, webhookController.handlePrinterCallback);

export default router;
