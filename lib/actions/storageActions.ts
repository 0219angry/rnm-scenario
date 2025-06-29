'use server';

import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '../auth';

export async function getSignedUrl(sessionId: string, fileName: string, fileType: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase.storage
    .from('session-files')
    .createSignedUploadUrl(`${sessionId}/${fileName}`, {
      upsert: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
