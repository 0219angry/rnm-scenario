import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ParticipantRole } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("認証されていません", { status: 401 });
    }

    const { id: sessionId, userId } = await params;
    const { role } = (await req.json()) as { role: ParticipantRole };

    // このセッションのオーナーか確認
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { ownerId: true },
    });

    // 権限チェック：セッションのオーナーのみが役割を変更できる
    if (session?.ownerId !== currentUser.id) {
      return new NextResponse("権限がありません", { status: 403 });
    }

    // 役割を更新
    await prisma.sessionParticipant.update({
      where: {
        sessionId_userId: {
          sessionId: sessionId,
          userId: userId,
        },
      },
      data: {
        role: role,
      },
    });

    return NextResponse.json({ message: "役割を更新しました" });
  } catch (error) {
    console.error(error);
    return new NextResponse("サーバーエラーが発生しました", { status: 500 });
  }
}

// ✅【新規追加】参加者をキックするためのDELETEメソッド
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ sessionId: string; userId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("認証されていません", { status: 401 });
    }

    const { sessionId, userId: userToKickId } = await context.params;

    // このセッションのオーナーか確認
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { ownerId: true },
    });

    // 権限チェック：セッションのオーナーのみがキックできる
    if (session?.ownerId !== currentUser.id) {
      return new NextResponse("権限がありません", { status: 403 });
    }

    // オーナー自身をキックすることはできない
    if (session.ownerId === userToKickId) {
      return new NextResponse("セッションの作成者はキックできません", { status: 400 });
    }

    // 参加記録を削除（キック処理）
    await prisma.sessionParticipant.delete({
      where: {
        sessionId_userId: {
          sessionId: sessionId,
          userId: userToKickId,
        },
      },
    });

    return NextResponse.json({ message: "参加者を削除しました" });

  } catch (error) {
    console.error("参加者の削除中にエラー", error);
    return new NextResponse("サーバーエラーが発生しました", { status: 500 });
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