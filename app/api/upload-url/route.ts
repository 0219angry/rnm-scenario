// app/api/upload-url/route.ts
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sessionId, fileName, fileType } = await request.json();

  if (!sessionId || !fileName || !fileType) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  // service_role を使った supabase client を作成（RLSをバイパスするため）
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const path = `${sessionId}/${fileName}`;

  try {
    const { data, error } = await supabase.storage
      .from('session-files')
      .createSignedUploadUrl(path, {
        upsert: true
      });

    if (error || !data) {
      console.error('Upload URL creation failed:', error);
      throw error ?? new Error('No data returned');
    }

    return NextResponse.json({
      path,
      signedUrl: data.signedUrl,
      token: data.token,
    });
  } catch (error) {
    console.error('Upload URL creation failed:', error);
    return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 });
  }
}
