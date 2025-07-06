import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ParticipantRole } from "@prisma/client";

import type { AuthorInfo } from '@/components/features/chats/ChatWindow';

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await context.params).id;

    if (!id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const session = await prisma.session.findUnique({
      where: { id: id },
      include: {
        // 参加者情報と、それに関連するユーザー情報を取得
        participants: {
          include: {
            user: {
              select: { // 必要なユーザー情報のみを選択
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // フロントエンドで使いやすいAuthorInfo[]の形式に変換
    const participants: AuthorInfo[] = session.participants.map(
      p => p.user
    );

    return NextResponse.json(participants);

  } catch (error) {
    console.error('Failed to fetch session participants:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}




// ✅【新規追加】オーナーがユーザーをセッションに追加するためのPOSTメソッド
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("認証されていません", { status: 401 });
    }

    const sessionId = (await context.params).id;

    // リクエストボディから追加したいユーザーIDと役割を取得
    const { userId, role } = (await req.json()) as { userId: string, role?: ParticipantRole };

    if (!userId) {
      return new NextResponse("ユーザーIDが指定されていません", { status: 400 });
    }

    // 権限チェック：リクエスト者がセッションのオーナーか確認
    const session = await prisma.session.findFirst({
        where: { id: sessionId, ownerId: currentUser.id },
    });
    if (!session) {
        return new NextResponse("権限がないか、セッションが存在しません", { status: 403 });
    }
    
    // 参加者として登録
    const newParticipant = await prisma.sessionParticipant.create({
      data: {
        sessionId: sessionId,
        userId: userId,
        role: role || ParticipantRole.UNDECIDED, // デフォルトは UNDECIDED
      },
    });

    return NextResponse.json(newParticipant, { status: 201 }); // 201 Created
  } catch (error) {
    // 既に参加済みの場合(P2002)などのエラーを捕捉
    console.error(error);
    return new NextResponse("ユーザーの追加に失敗しました。既に参加済みかもしれません。", { status: 500 });
  }
}