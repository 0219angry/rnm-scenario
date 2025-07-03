import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { content, channelId } = await req.json();

  if (!content || !channelId) {
    return NextResponse.json({ error: 'Missing content or channelId' }, { status: 400 });
  }

  try {
    const message = await prisma.message.create({
      data: {
        content,
        channelId,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Supabase Realtimeへの通知（これはクライアント側でリッスンする）
    // Prismaの操作が完了した時点で、Supabaseのトリガーが発動する想定

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Message creation failed:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}
