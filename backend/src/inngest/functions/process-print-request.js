import { inngest } from '../client.js';
import axios from 'axios';

/**
 * Inngest background process function.
 * Triggered asynchronously by 'kiosk/print.requested' events.
 */
export const processPrintRequest = inngest.createFunction(
  { id: 'process-badge-print-request' },
  { event: 'kiosk/print.requested' },
  async ({ event, step }) => {
    const { attendeeId, qrCode, name } = event.data;

    // Step 1: Hand over the payload structure to the badge printer vendor queue
    await step.run('forward-to-vendor-queue', async () => {
      // Points to the printing vendor's ingestion broker endpoint
      const vendorQueueEndpoint = 'https://vendor-badge-printer.com';
      
      try {
        await axios.post(vendorQueueEndpoint, {
          // Pass the database primary key safely through the vendor's metadata hook
          vendor_job_metadata: { 
            attendeeDbId: attendeeId 
          },
          badge_data: { 
            qr_code: qrCode, 
            full_name: name 
          },
          // Callback address where the printer will dispatch its successful execution confirmation
          callback_url: 'http://localhost:3000/api/webhooks/printer' 
        }, {
          headers: { 
            'Authorization': `Bearer ${process.env.VENDOR_API_KEY || 'mock_vendor_key_2026'}` 
          },
          timeout: 5000
        });
      } catch (error) {
        console.error(`[Inngest Worker Engine Fault] Queue push failed for ${attendeeId}:`, error.message);
        // Throwing the error tells Inngest to trigger its built-in automated retry logic
        throw error;
      }
    });

    return { success: true, trackedAttendeeId: attendeeId };
  }
);
