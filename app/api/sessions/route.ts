import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth"; // 自前の認証に合わせて実装してねっ！

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "未認証です" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      scenarioId,
      scheduledAt,
      notes,
    } = body;

    if (!scenarioId || !scheduledAt) {
      return NextResponse.json({ error: "必須項目が足りません" }, { status: 400 });
    }

    const session = await prisma.session.create({
      data: {
        title: title || "無題のセッション", // タイトルは任意なのでデフォルト値を設定
        scenarioId,
        scheduledAt: new Date(scheduledAt),
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
