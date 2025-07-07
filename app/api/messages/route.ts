import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // URLのクエリパラメータからchannelIdを取得
    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId');

    if (!channelId) {
      return NextResponse.json({ error: 'channelId is required' }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: { 
        channelId: channelId,
        OR: [
          {
            // 全員に公開のメッセージ (recipientIdがnull)
            recipientId: null,
          },
          {
            // 自分が書いたメッセージ
            authorId: user.id,
          },
          {
            // 自分宛てのメッセージ
            recipientId: user.id,
          },
        ],
      },
      include: {
        author: { // authorリレーションを含める
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(messages);

  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {  
  try{
    const currentUser = await getCurrentUser();

    if (!currentUser) {  
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });  
    }  

    const { content, channelId, recipientId } = await req.json();  

    if (!content || !channelId) {  
      return NextResponse.json({ error: 'Content and channelId are required' }, { status: 400 });  
    }  

    // 1. 作成したメッセージを変数に格納する
    const newMessage = await prisma.message.create({
      data: {
        content,
        channelId,
        authorId: currentUser.id,
        recipientId,
      },
      // 2. 関連する投稿者の情報も一緒に取得する
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // 3. 作成されたメッセージオブジェクトそのものを返す
    return NextResponse.json(newMessage);
  } catch (error) {
    console.error("投稿失敗: ", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}  