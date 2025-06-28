import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ParticipantRole } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("認証されていません", { status: 401 });
    }

    const sessionId = params.id;
    const userId = user.id;

    const body = await req.json();
    const role = body.role as ParticipantRole | undefined;



    // 参加者として登録（重複登録はスキーマの@@id制約で自動的に失敗する）
    await prisma.sessionParticipant.create({
      data: {
        sessionId: sessionId,
        userId: userId,
        role: role || "UNDECIDED", // 役割が指定されていない場合は UNDECIDED とする
      },
    });

    return new NextResponse("セッションに参加しました", { status: 200 });
  } catch (error) {
    // Prismaのユニーク制約違反(P2002)などをここで捕捉
    console.error(error);
    return new NextResponse("既に参加しているか、サーバーエラーが発生しました", { status: 500 });
  }
}