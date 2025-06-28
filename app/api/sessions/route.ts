import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { parse } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "未認証です" }, { status: 401 });
    }

    const body = await req.json();
    const { title, scenarioId, scheduledAt, notes } = body;

    if (!scenarioId || !scheduledAt) {
      return NextResponse.json({ error: "必須項目が足りません" }, { status: 400 });
    }

    // 📌 ローカル時刻として解釈（ズレ防止！）
    const scheduledDate = parse(scheduledAt, "yyyy-MM-dd'T'HH:mm", new Date());

    const session = await prisma.session.create({
      data: {
        title: title || "無題のセッション",
        scenarioId,
        scheduledAt: scheduledDate,
        notes,
        ownerId: user.id,
      },
    });

    return NextResponse.json({ id: session.id }, { status: 201 });
  } catch (error) {
    console.error("セッション作成エラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
