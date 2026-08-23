import { supabase } from '../lib/supabase.js';

export const printService = {
  async markAsPrinted(attendeeId) {
    const { data, error } = await supabase
      .from('attendees')
      .update({ check_in_status: 'CHECKED_IN' })
      .eq('id', attendeeId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }
};
