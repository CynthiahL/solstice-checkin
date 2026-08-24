import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pull production variables cleanly out of your local environmental configuration block
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Centrally managed web service production endpoints
const TARGET_WEBHOOK_URL = 'https://solstice-checkin-api.onrender.com';
const WEBHOOK_SIGNING_SECRET = process.env.WEBHOOK_SIGNING_SECRET || 'vendor_webhook_secret_2026';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function executeAutomatedWebhookConfirmation() {
  console.log('🤖 Initializing live cloud target attendee ID lookup sequence...');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: Production SUPABASE environment keys are missing inside your local backend/.env file.');
    return;
  }

  try {
    // 1. Fetch the active record stuck in a pending processing print loop from your live database cluster
    const dbSnapshot = await axios.get(
      `${SUPABASE_URL}/rest/v1/attendees?check_in_status=eq.PRINT_PENDING&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      }
    );

    // 2. Fallback check gate if no scans are active
    if (!dbSnapshot.data || dbSnapshot.data.length === 0) {
      console.log('⚠️  No live attendee profiles are currently flag-locked inside a "PRINT_PENDING" state.');
      console.log('👉 Action: Open https://solstice-checkin-frontend.vercel.app/, submit a clean code, and re-run.');
      return;
    }

    const targetAttendee = dbSnapshot.data[0];
    const targetAttendeeId = targetAttendee.id;

    console.log(`🎯 Active live transaction traced! Target user found: ${targetAttendee.name} (${targetAttendeeId})`);

    // 3. Assemble the authentic vendor network callback schema payload
    const payload = {
      event_type: 'print.success',
      attendeeId: targetAttendeeId
    };

    // 4. Compute the cryptographic signature using your shared security secret token keys
    const signature = crypto
      .createHmac('sha256', WEBHOOK_SIGNING_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');

    console.log('📤 Dispatching signed production webhook callback packet to live Render network routing...');

    // 5. Inject the mock completion webhook directly back into your live web api server container
    const webhookResponse = await axios.post(TARGET_WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'x-solstice-signature': signature
      }
    });

    console.log(`✅ Webhook confirmed! Live Render server responded with HTTP status code: ${webhookResponse.status}`);
    console.log('🚀 Check your React Vercel browser dashboard window—the screen will instantly update to green!');

  } catch (error) {
    console.error('❌ Cloud automated webhook injection failed:', error.response?.data || error.message);
  }
}

executeAutomatedWebhookConfirmation();
