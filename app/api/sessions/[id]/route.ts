import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// ✅【新規追加】セッションを削除するためのDELETEメソッド
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