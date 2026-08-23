import { attendeeService } from '../services/attendeeService.js';
import { inngest } from '../inngest/client.js';

export const checkinController = {
  /**
   * Processes an incoming kiosk scan request.
   * Leverages atomic database query checks to guard against race conditions.
   */
  async processScan(req, res, next) {
    const { qrCode } = req.body;

    if (!qrCode) {
      return res.status(400).json({ 
        status: 'error',
        message: 'QR Code is a required request payload parameter.' 
      });
    }

    try {
      // 1. Attempt an atomic state lock directly via the database engine
      const lockedRecord = await attendeeService.lockForPrinting(qrCode);

      // 2. If no record is returned, the row is already locked (PRINT_PENDING) or complete (CHECKED_IN)
      if (!lockedRecord) {
        const attendee = await attendeeService.getAttendeeByQr(qrCode);
        
        if (!attendee) {
          return res.status(404).json({ 
            status: 'error',
            message: 'Attendee profile matching this QR code does not exist.' 
          });
        }

        // Duplicate scan found: Return 409 Conflict alongside the current active state
        return res.status(409).json({ 
          status: 'error',
          error: 'Duplicate scan blocked.', 
          currentStatus: attendee.check_in_status,
          message: 'An active check-in transaction or printed badge already exists for this profile.'
        });
      }

      // 3. Dispatch data out-of-thread to the Inngest background event broker architecture
      await inngest.send({
        name: 'kiosk/print.requested',
        data: { 
          attendeeId: lockedRecord.id, 
          qrCode: lockedRecord.qr_code,
          name: lockedRecord.name
        }
      });

      // 4. Return an instant 202 Accepted status response to unblock the client kiosk UI loop
      return res.status(202).json({ 
        status: 'PRINT_PENDING', 
        attendeeId: lockedRecord.id,
        message: 'Print assignment safely verified and queued for delivery.'
      });

    } catch (err) {
      // Forward unhandled service level faults cleanly to centralized error handling middleware
      next(err);
    }
  }
};
