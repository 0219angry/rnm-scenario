import { NextResponse } from "next/server";
import { fetchScenarioById } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { Genre } from "@prisma/client";
import { prisma } from "@/lib/prisma";


export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop(); 

  if (!id) {
    return new NextResponse("IDが指定されていません…", { status: 400 });
  }

  const scenario = await fetchScenarioById(id);

  if (!scenario) {
    return new NextResponse("シナリオが見つかりません…", { status: 404 });
  }

  return NextResponse.json(scenario);
}

// ✅ 1. Zodで更新データ用のバリデーションスキーマを定義
// partial()を使うことで、全てのフィールドを任意（オプショナル）にできる
const scenarioUpdateSchema = z.object({
  title: z.string().min(1, "タイトルは必須です").optional(),
  playerMin: z.coerce.number().int().min(1).optional(),
  playerMax: z.coerce.number().int().min(1).optional(),
  requiresGM: z.boolean().optional(),
  genre: z.nativeEnum(Genre).optional(),
  averageTime: z.coerce.number().int().min(0).optional(),
  distribution: z.string().url("有効なURLを入力してください").optional().or(z.literal('')),
  priceMax: z.coerce.number().int().nonnegative("価格上限は0円以上で入力してください").optional(),
  priceMin: z.coerce.number().int().nonnegative("価格下限は0円以上で入力してください").optional(),
  content: z.string().max(5000, "内容は5000文字以内です").optional(),
  isPublic: z.boolean().optional(),
  rulebookId: z.string().optional().nullable(),
}).refine(data => {
    // playerMinとplayerMaxが存在する場合の整合性チェック
    if (data.playerMin !== undefined && data.playerMax !== undefined) {
        return data.playerMin <= data.playerMax;
    }
    return true;
}, {
    message: "最小プレイヤー数は最大プレイヤー数以下である必要があります",
    path: ["playerMin"], // エラーを関連付けるフィールド
}).refine(data => {
  // priceMaxとpriceMinの関係を定義
  if (data.priceMax !== undefined && data.priceMin !== undefined) {
    return data.priceMax >= data.priceMin;
  }
  return true; // どちらかが未指定ならOK
},{
  message:"最大価格は最低価格以上である必要があります",
  path: ["priceMax"]
});


// PUT /api/scenarios/[id]
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ 2. 認証チェック
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("認証されていません", { status: 401 });
    }

    const scenarioId = (await context.params).id;

    // ✅ 3. 権限チェック (シナリオのオーナーか確認)
    const scenario = await prisma.scenario.findUnique({
      where: { id: scenarioId },
    });

    if (!scenario) {
      return new NextResponse("シナリオが見つかりません", { status: 404 });
    }
    if (scenario.ownerId !== currentUser.id) {
      return new NextResponse("権限がありません", { status: 403 });
    }

    // ✅ 4. リクエストボディを取得し、バリデーション
    const body = await req.json();
    const validation = scenarioUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.format() }, { status: 400 });
    }
    
    // ✅ 5. データベースを更新
    const updatedScenario = await prisma.scenario.update({
      where: {
        id: scenarioId,
      },
      data: {
        ...validation.data,
        // 空文字列が送られてきた場合にnullに変換するフィールド
        rulebookId: validation.data.rulebookId === "" ? null : validation.data.rulebookId,
        distribution: validation.data.distribution === "" ? null : validation.data.distribution,
      },
    });

    return NextResponse.json(updatedScenario);

  } catch (error) {
    console.error("シナリオ更新エラー:", error);
    return new NextResponse("サーバーエラーが発生しました", { status: 500 });
  }
}