// app/api/notifications/route.ts
import { prisma } from "@/lib/prisma"; // Neon用のPrisma
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth"; // セッションから現在のユーザー取得

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { toUserId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10, // 必要に応じてページネーション
  });

  return NextResponse.json(notifications);
}