import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
// isValid を date-fns から追加でインポートします
import { parse, isValid } from "date-fns";

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
    // scheduledAt を ISO 8601 形式の文字列として受け取ることを想定
    const scheduledDate = new Date(scheduledAt);

    // 念のため、変換後の日付が有効かチェック
    if (!isValid(scheduledDate)) {
      return NextResponse.json(
        { error: "無効な日付データが送信されました。" },
        { status: 400 }
      );
    }

    const session = await prisma.session.create({
      data: {
        title: title || "無題のセッション",
        scenarioId,
        scheduledAt: scheduledDate, // ✅ 検証済みの有効な日付
        notes,
        ownerId: user.id,
      },
    });

    return NextResponse.json({ id: session.id }, { status: 201 });
  } catch (error) {
    // PrismaClientValidationError もここで捕捉される
    console.error("セッション作成エラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}