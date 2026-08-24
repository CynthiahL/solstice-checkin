import { inngest } from "../client.js";
import axios from "axios";

/**
 * Inngest background process function.
 * Triggered asynchronously by 'kiosk/print.requested' events.
 */
export const processPrintRequest = inngest.createFunction(
  { id: "process-badge-print-request" },
  { event: "kiosk/print.requested" },
  async ({ event, step }) => {
    const { attendeeId, qrCode, name } = event.data;

    await step.run("forward-to-vendor-queue", async () => {
      // Mocking target vendor queue handler link loop parameters
      const vendorQueueEndpoint = "https://vendor-badge-printer.com";

      try {
        await axios.post(
          vendorQueueEndpoint,
          {
            vendor_job_metadata: { attendeeDbId: attendeeId },
            badge_data: { qr_code: qrCode, full_name: name },
            // 🎯 Fixed: Points directly to your real, active, live backend server web service URL endpoint container on Render
            callback_url: "https://solstice-checkin-api.onrender.com/api/webhooks/printer",
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.VENDOR_API_KEY || "mock_vendor_key_2026"}`,
            },
            timeout: 5000,
          }
        );
      } catch (error) {
        console.error(`[Inngest Worker Engine Fault] Queue push failed for ${attendeeId}:`, error.message);
        // Throwing the error alerts Inngest Cloud to initialize its automated exponential retry fallback queues
        throw error;
      }
    });

    return { success: true, trackedAttendeeId: attendeeId };
  }
);
