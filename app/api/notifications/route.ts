// app/api/notifications/route.ts
import { prisma } from "@/lib/prisma"; // Neon用のPrisma
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth"; // セッションから現在のユーザー取得
import { NotificationType } from "@prisma/client";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { toUserId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10, // 必要に応じてページネーション
  });

  return NextResponse.json(notifications);
}

/**
 * 新しい通知を作成する
 */
export async function POST(request: Request) {
  try {
    // 1. 認証：現在のセッションユーザーを取得
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. リクエストボディのパースとバリデーション
    const body = await request.json();
    const {
      toUserId,
      message,
      linkUrl,
    }: { toUserId: string; message: string; linkUrl?: string } = body;

    if (!toUserId || !message) {
      return NextResponse.json(
        { error: "toUserIdとmessageは必須項目です" },
        { status: 400 }
      );
    }

    // 3. データベースに通知レコードを作成
    const newNotification = await prisma.notification.create({
      data: {
        type: NotificationType.FILE_SHARE,
        toUserId, // リクエストボディから取得
        fromUserId: currentUser.id, // 通知元は必ず現在のセッションユーザー
        message,    // リクエストボディから取得
        linkUrl,    // リクエストボディから取得（任意）
      },
    });

    // 4. 成功レスポンス (201 Created)
    return NextResponse.json(newNotification, { status: 201 });

  } catch (error) {
    console.error("通知の作成中にエラーが発生しました:", error);
    // リクエストボディが不正なJSONの場合のエラーハンドリング
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "無効なJSON形式です" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}