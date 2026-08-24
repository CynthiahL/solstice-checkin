import crypto from 'crypto';

export const verifyPrinterWebhookSignature = (req, res, next) => {
  const signatureHeader = req.headers['x-solstice-signature'];
  const WEBHOOK_SIGNING_SECRET = process.env.WEBHOOK_SIGNING_SECRET || 'vendor_webhook_secret_2026';

  if (!signatureHeader) {
    return res.status(401).send('Missing cryptographic validation routing header credentials.');
  }

  // Compute the expected validation signature using identical secure hashing mechanisms
  const calculatedSignature = crypto
    .createHmac('sha256', WEBHOOK_SIGNING_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signatureHeader !== calculatedSignature) {
    return res.status(403).send('Forbidden: Cryptographic signature mismatch detected.');
  }

  next();
};
