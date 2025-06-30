import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/**
 * 現在のユーザーの未読通知をすべて既読にする
 */
export async function POST(_req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // PrismaのupdateManyを使用して、条件に一致する複数のレコードを一度に更新
    const result = await prisma.notification.updateMany({
      where: {
        toUserId: currentUser.id, // 自分宛の通知で、
        isRead: false,          // まだ読んでいないもの
      },
      data: {
        isRead: true, // すべて既読状態に更新
      },
    });

    // result.count には更新されたレコード数が格納される
    return NextResponse.json({
      message: "すべての通知を既読にしました",
      count: result.count,
    });

  } catch (error) {
    console.error("一括既読処理中にエラーが発生しました:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}