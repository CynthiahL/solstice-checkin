import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path'; // 1. Import Node's native path module
import { fileURLToPath } from 'url';

// 2. Compute absolute paths so the .env file can be located from any execution directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const TARGET_WEBHOOK_URL = 'http://localhost:3000/api/webhooks/printer';
const WEBHOOK_SIGNING_SECRET = process.env.WEBHOOK_SIGNING_SECRET || 'vendor_webhook_secret_2026';


// Read configuration keys directly to scan your active database state
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function executeAutomatedWebhookConfirmation() {
  console.log('🤖 Initializing automated ID lookup sequence...');

  if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is missing from your .env file.');
    return;
  }

  try {
    // 1. Query the database directly via REST to capture the active pending print row
    const dbSnapshot = await axios.get(
      `${SUPABASE_URL}/rest/v1/attendees?check_in_status=eq.PRINT_PENDING&limit=1`, 
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      }
    );

    // 2. Fallback check: alert the engineer if no kiosk rows are currently waiting
    if (!dbSnapshot.data || dbSnapshot.data.length === 0) {
      console.log('⚠️  No attendee profiles are currently in a "PRINT_PENDING" state.');
      console.log('👉 Action: Scan a code inside your browser UI (http://localhost:5173) first, then re-run this script.');
      return;
    }

    const targetAttendee = dbSnapshot.data[0];
    const targetAttendeeId = targetAttendee.id;

    console.log(`🎯 Active job traced! Target user found: ${targetAttendee.name} (${targetAttendeeId})`);

    // 3. Assemble the authentic callback payload structures
    const payload = {
      event_type: 'print.success',
      attendeeId: targetAttendeeId
    };

    // 4. Compute identical cryptographic signature hashes to clear your backend auth middleware barriers
    const signature = crypto
      .createHmac('sha256', WEBHOOK_SIGNING_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');

    console.log('📤 Dispatching signed webhook callback packet to backend network routing...');

    // 5. Fire the completed payload back down into your server endpoint
    const webhookResponse = await axios.post(TARGET_WEBHOOK_URL, payload, {
      headers: { 
        'Content-Type': 'application/json', 
        'x-solstice-signature': signature 
      }
    });

    console.log(`✅ Webhook confirmed! Server responded with HTTP status code: ${webhookResponse.status}`);
    console.log(`💬 Message: "${webhookResponse.data}"`);
    console.log('🚀 Check your React browser dashboard window—the screen will have smoothly updated to green!');

  } catch (error) {
    console.error('❌ Automated webhook injection failed:', error.response?.data || error.message);
  }
}

executeAutomatedWebhookConfirmation();
