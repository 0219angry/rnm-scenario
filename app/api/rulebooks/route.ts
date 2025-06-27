// app/api/rulebooks/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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