// lib/storage.ts
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function createSignedUploadUrl(path: string) {
  const { data, error } = await supabaseAdmin.storage
    .from('session-files')
    .createSignedUploadUrl(path, {
      upsert: true,
    });

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteFile(path: string) {
  // removeメソッドはパスの配列を受け取ります
  const { data, error } = await supabaseAdmin.storage
    .from('session-files')
    .remove([path]);

  if (error) throw new Error(error.message);
  return data;
}