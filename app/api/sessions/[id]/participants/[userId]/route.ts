import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ParticipantRole } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ sessionId: string; userId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("認証されていません", { status: 401 });
    }

    const { sessionId, userId } = await params;
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