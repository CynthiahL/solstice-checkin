import { supabase } from '../lib/supabase.js';

export const checkinService = {
  /**
   * Atomically locks an attendee state to PRINT_PENDING if they are eligible.
   */
  async initiateCheckin(qrCode) {
    // Single atomic database query to fetch, check status, and lock the row
    const { data, error } = await supabase
      .from('attendees')
      .update({ check_in_status: 'PRINT_PENDING' })
      .eq('qr_code', qrCode)
      .eq('check_in_status', 'NOT_CHECKED_IN') // Enforces strict idempotency
      .select()
      .single();

    if (error || !data) {
      // Fetch current status to determine the exact error reason
      const { data: currentAttendee } = await supabase
        .from('attendees')
        .select('check_in_status')
        .eq('qr_code', qrCode)
        .single();

      if (currentAttendee) {
        return { 
          success: false, 
          reason: 'ALREADY_PROCESSED', 
          status: currentAttendee.check_in_status 
        };
      }
      return { success: false, reason: 'NOT_FOUND' };
    }

    return { success: true, attendee: data };
  },

  /**
   * Finalizes the check-in state when the asynchronous webhook confirms printing.
   */
  async finalizeCheckin(attendeeId) {
    const { data, error } = await supabase
      .from('attendees')
      .update({ check_in_status: 'CHECKED_IN' })
      .eq('id', attendeeId)
      .select()
      .single();

    if (error) {
      console.error(`Database resolution failure for attendee ${attendeeId}:`, error.message);
      return { success: false };
    }

    return { success: true, attendee: data };
  }
};
