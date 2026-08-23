import { printService } from '../services/printService.js';
// Fixed path: moves up one directory layer to find app.js inside src/
import { emitToKiosk } from '../app.js';

export const webhookController = {
  async handlePrinterCallback(req, res, next) {
    const { event_type, attendeeId } = req.body;

    if (event_type !== 'print.success') {
      return res.status(200).send('Non-success event acknowledged.');
    }

    try {
      const updatedRecord = await printService.markAsPrinted(attendeeId);
      
      if (updatedRecord) {
        emitToKiosk(attendeeId, { status: 'CHECKED_IN' });
      }

      return res.status(200).send('Webhook resolved successfully.');
    } catch (err) {
      next(err);
    }
  }
};
