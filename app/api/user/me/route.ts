import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies(); // 🍪 await 忘れずに！
    const sessionToken = cookieStore.get("sessionToken")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await prisma.userSession.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Session not found" }, { status: 401 });
    }

    // 必要なフィールドだけ返す（セキュリティ上おすすめ！）
    const { id, name, username, email, image } = session.user;

    return NextResponse.json({
      user: { id, name, username, email, image },
    });
  } catch (err) {
    console.error("Failed to get current user:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
