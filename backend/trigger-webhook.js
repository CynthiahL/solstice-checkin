import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pull keys safely out of your local .env configuration file registry mapping
dotenv.config({ path: path.resolve(__dirname, '.env') });

// 🎯 production-hardened routing changes: Linked straight to your hosted web service targets
const TARGET_WEBHOOK_URL = 'https://solstice-checkin-api.onrender.com';
const WEBHOOK_SIGNING_SECRET = process.env.WEBHOOK_SIGNING_SECRET || 'vendor_webhook_secret_2026';

// 🎯 Cloud Sync Change: Pull keys directly from your live, cloud-hosted Supabase dashboard variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function executeAutomatedWebhookConfirmation() {
  console.log('🤖 Initializing live cloud target attendee ID lookup sequence...');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: Production SUPABASE environment keys are missing inside your local .env file.');
    console.log('Action: Ensure your local backend/.env contains your true cloud-hosted Supabase URL strings.');
    return;
  }

  try {
    // 1. Query your active live production Supabase REST interface for the record stuck in printing loop states
    const dbSnapshot = await axios.get(
      `${SUPABASE_URL}/rest/v1/attendees?check_in_status=eq.PRINT_PENDING&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      }
    );

    // 2. Fallback check validation gate
    if (!dbSnapshot.data || dbSnapshot.data.length === 0) {
      console.log('⚠️  No live attendee profiles are currently flag-locked inside a "PRINT_PENDING" state.');
      console.log('👉 Action: Open https://solstice-checkin-frontend.vercel.app/, input a fresh registration code, and re-run.');
      return;
    }

    const targetAttendee = dbSnapshot.data[0];
    const targetAttendeeId = targetAttendee.id;

    console.log(`🎯 Active live transaction traced! Target user found: ${targetAttendee.name} (${targetAttendeeId})`);

    // 3. Assemble the authentic callback payload structures
    const payload = {
      event_type: 'print.success',
      attendeeId: targetAttendeeId
    };

    // 4. Compute identical cryptographic signature hashes to clear your cloud backend middleware checkpoints
    const signature = crypto
      .createHmac('sha256', WEBHOOK_SIGNING_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');

    console.log('📤 Dispatching signed production webhook callback packet to live Render network routing...');

    // 5. Fire the completed payload back down into your server endpoint container
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
