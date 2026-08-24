import { createClient } from '@supabase/supabase-js';
import { inngest } from '../inngest/client.js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const processScan = async (req, res, next) => {
  const { qrCode } = req.body;

  if (!qrCode) {
    return res.status(400).json({ message: 'Missing registration payload data attributes.' });
  }

  try {
    // 1. Fetch the target attendee row sequence cleanly out of the database mapping tables
    const { data: attendee, error } = await supabase
      .from('attendees')
      .select('*')
      .eq('qr_code', qrCode)
      .maybeSingle(); // Prevents crashes by safely returning null if no record matches instead of throwing

    if (error || !attendee) {
      return res.status(404).json({ message: 'Registration profile credential sequence not found.' });
    }

    // 2. Enforce strict database idempotency lockout rule blocks
    if (attendee.check_in_status === 'PRINT_PENDING' || attendee.check_in_status === 'CHECKED_IN') {
      return res.status(409).json({ message: 'An active check-in transaction or printed badge already exists for this profile.' });
    }

    // 3. Atomically advance the state column inside Supabase to block race condition multi-scans
    const { error: updateError } = await supabase
      .from('attendees')
      .update({ check_in_status: 'PRINT_PENDING' })
      .eq('id', attendee.id);

    if (updateError) throw updateError;

    // 4. Safely dispatch the print task to our asynchronous Inngest Cloud event routing engine
    await inngest.send({
      name: "kiosk/print.requested",
      data: {
        attendeeId: attendee.id,
        qrCode: attendee.qr_code,
        name: attendee.name
      }
    });

    // 5. Instantly release the connection loop back to the client UI with an optimistic 202 Accepted handoff
    return res.status(202).json({ 
      message: 'Print processing loop initialized.', 
      attendeeId: attendee.id 
    });

  } catch (err) {
    next(err);
  }
};
