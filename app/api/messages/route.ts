import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {  
  try{
    const currentUser = await getCurrentUser();

    if (!currentUser) {  
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });  
    }  

    const { content, channelId } = await req.json();  

    if (!content || !channelId) {  
      return NextResponse.json({ error: 'Content and channelId are required' }, { status: 400 });  
    }  

    await prisma.message.create({
          data: {
            content,
            channelId,
            authorId: currentUser.id,
          },
        });
      return NextResponse.json({
      message: "投稿完了"
    });
  } catch (error) {
    console.error("投稿失敗: ", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}  