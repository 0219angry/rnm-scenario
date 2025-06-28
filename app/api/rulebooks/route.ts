// app/api/rulebooks/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

const rulebookSchema = z.object({
  name: z.string().min(1, "ルールブック名は必須です"),
  system: z.string().min(1, "システム名は必須です"),
  publisher: z.string().optional(),
  url: z.string().url("有効なURLを入力してください").optional().or(z.literal('')),
  description: z.string().optional(),
});

export async function GET() {
  try {
    const rulebooks = await prisma.rulebook.findMany({
      // フォームで必要なidとtitleのみを取得
      select: {
        id: true,
        name: true, 
      },
      orderBy: {
        // 必要であれば並び順を指定
        name: 'asc',
      },
    });
    return NextResponse.json(rulebooks);
  } catch (error) {
    console.error("Failed to fetch rulebooks:", error);
    // エラーが発生した場合は、500エラーとエラーメッセージを返す
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("認証されていません", { status: 401 });
    }

    const body = await req.json();
    const validation = rulebookSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const newRulebook = await prisma.rulebook.create({
      data: {
        name: validation.data.name,
        system: validation.data.system,
        publisher: validation.data.publisher,
        url: validation.data.url || null, // 空文字列の場合はnullを保存
        description: validation.data.description,
      },
    });

    return NextResponse.json(newRulebook, { status: 201 });
  } catch (error) {
    console.error("ルールブック作成エラー:", error);
    return new NextResponse("サーバーエラーが発生しました", { status: 500 });
  }
}