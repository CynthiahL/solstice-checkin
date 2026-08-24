import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize a dedicated high-privilege driver client instance to communicate with the cloud cluster
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const checkinService = {
  completeCheckin: async (attendeeId) => {
    const { data, error } = await supabase
      .from('attendees')
      .update({ check_in_status: 'CHECKED_IN' })
      .eq('id', attendeeId)
      .select();

    if (error) throw error;
    return data;
  }
};
