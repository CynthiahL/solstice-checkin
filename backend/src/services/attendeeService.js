import { supabase } from '../lib/supabase.js';

export const attendeeService = {
  async getAttendeeByQr(qrCode) {
    const { data, error } = await supabase
      .from('attendees')
      .select('*')
      .eq('qr_code', qrCode)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  // Lock state directly at the query layer to provide instant duplicate scan protection
  async lockForPrinting(qrCode) {
    const { data, error } = await supabase
      .from('attendees')
      .update({ check_in_status: 'PRINT_PENDING' })
      .eq('qr_code', qrCode)
      .eq('check_in_status', 'NOT_CHECKED_IN') // Strict idempotency guardrail
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }
};
