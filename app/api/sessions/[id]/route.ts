import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // URLの動的セグメントからsessionIdを取得
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: 'sessionId is required' },
        { status: 400 }
      );
    }

    // Prismaを使ってデータベースを検索
    const session = await prisma.session.findUnique({
      where: { id: id },
      // 以前と同様に必要な関連データを含める
      include: {
        scenario: {
          include: {
            rulebook: true,
          },
        },
        owner: true,
        participants: {
          orderBy: { assignedAt: 'asc' },
          include: {
            user: true,
          },
        },
      },
    });

    // セッションが見つからなかった場合
    if (!session) {
      return NextResponse.json(
        { message: 'Session not found' },
        { status: 404 }
      );
    }

    // 成功した場合、セッションデータを返す
    return NextResponse.json(session, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("認証されていません", { status: 401 });
    }

    const sessionId = (await context.params).id;
    const body = await req.json();

    // セッションのオーナーであることを確認
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { ownerId: true },
    });

    if (!session) {
      return new NextResponse("セッションが見つかりません", { status: 404 });
    }

    // 権限チェック：セッションのオーナーのみが更新できる
    if (session.ownerId !== currentUser.id) {
      return new NextResponse("権限がありません", { status: 403 });
    }

    // セッションを更新
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: body,
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("セッションの更新中にエラー", error);
    return new NextResponse("サーバーエラーが発生しました", { status: 500 });
  }
}


// 【新規追加】セッションを削除するためのDELETEメソッド
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("認証されていません", { status: 401 });
    }

    const sessionId = (await context.params).id;

    // 削除対象のセッションを取得し、オーナーであることを確認
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { ownerId: true },
    });

    if (!session) {
      return new NextResponse("セッションが見つかりません", { status: 404 });
    }

    // 権限チェック：セッションのオーナーのみが削除できる
    if (session.ownerId !== currentUser.id) {
      return new NextResponse("権限がありません", { status: 403 });
    }

    // セッションを削除
    // スキーマでonDelete: Cascadeを設定しているため、関連する参加者情報も自動で削除されます
    await prisma.session.delete({
      where: { id: sessionId },
    });

    return new NextResponse(null, { status: 204 }); // 204 No Content: 成功したが返すコンテンツはない
  } catch (error) {
    console.error("セッションの削除中にエラー", error);
    return new NextResponse("サーバーエラーが発生しました", { status: 500 });
  }
}

