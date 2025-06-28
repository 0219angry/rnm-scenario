import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("認証されていません", { status: 401 });
    }

    const sessionId = (await params).id;
    const userId = user.id;

    // 参加を取り消し
    await prisma.sessionParticipant.delete({
      where: {
        // スキーマの@@id([sessionId, userId])に対応
        sessionId_userId: {
          sessionId: sessionId,
          userId: userId,
        },
      },
    });

    return new NextResponse("参加を取り消しました", { status: 200 });
  } catch (error) {
    // レコードが存在しない場合のエラーもここで捕捉される
    console.error(error);
    return new NextResponse("サーバーエラーが発生しました", { status: 500 });
  }
}