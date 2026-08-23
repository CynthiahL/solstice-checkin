import crypto from 'crypto';

export const authMiddleware = {
  // Verifies requests coming from the physical Kiosk hardware devices
  verifyKioskApiKey(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing Kiosk hardware authorization token.' });
    }
    const token = authHeader.split(' ')[1];
    if (token !== process.env.KIOSK_API_KEY) {
      return res.status(403).json({ error: 'Forbidden: Invalid Kiosk access credentials.' });
    }
    next();
  },

  // Cryptographically verifies webhook event payloads using an HMAC SHA256 signature
  verifyWebhookSignature(req, res, next) {
    const signature = req.headers['x-solstice-signature'];
    if (!signature) {
      return res.status(401).json({ error: 'Unauthorized: Missing webhook signature payload header.' });
    }

    const computedSignature = crypto
      .createHmac('sha256', process.env.WEBHOOK_SIGNING_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computedSignature))) {
      return res.status(403).json({ error: 'Forbidden: Webhook verification signature mismatch.' });
    }
    next();
  }
};
