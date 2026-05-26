import type { CopyFormat } from '@/features/standup/lib/format-standup';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function updateDefaultCopyFormat(
  supabase: SupabaseClient,
  userId: string,
  format: CopyFormat
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('profiles')
    .update({ default_copy_format: format })
    .eq('id', userId);

  return { error: error?.message ?? null };
}
