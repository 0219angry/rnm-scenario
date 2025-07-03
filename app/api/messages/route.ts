import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const supabase = createPagesServerClient({ req, res });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { content, channelId } = req.body;

  const { error } = await supabase
    .from('messages')
    .insert({ content, channelId, authorId: user.id });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ success: true });
}