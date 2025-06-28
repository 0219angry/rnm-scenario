import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/users?search=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    if (!search) {
      // 検索クエリがない場合は空の配列を返す
      return NextResponse.json([]);
    }

    // ユーザー名または名前で部分一致検索
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
        ],
      },
      // パスワードなどの不要な情報は除外する
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
      },
      take: 10, // 最大10件まで
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("ユーザー検索エラー:", error);
    return new NextResponse("サーバーエラーが発生しました", { status: 500 });
  }
}