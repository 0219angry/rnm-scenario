import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ParticipantRole } from "@prisma/client";

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