import express from 'express';
import { verifyPrinterWebhookSignature } from '../middleware/auth.js'; // HMAC validator guard
import { checkinService } from '../services/checkinService.js';      // Handles Supabase mutations
import { emitToKiosk } from '../app.js';                              // Live WebSocket stream controller

const router = express.Router();

router.post('/printer', verifyPrinterWebhookSignature, async (req, res, next) => {
  const { attendeeId, event_type } = req.body;

  if (event_type !== 'print.success') {
    return res.status(400).send('Unhandled webhook event context routing criteria.');
  }

  try {
    // 1. Transition your database schema row record column value to 'CHECKED_IN'
    await checkinService.completeCheckin(attendeeId);

    // 2. Dispatch a real-time WebSocket notice out-of-band to update your Vercel frontend layout view
    emitToKiosk(attendeeId, { status: 'CHECKED_IN' });

    return res.status(200).send('Webhook resolved successfully.');
  } catch (error) {
    next(error);
  }
});

export default router;
