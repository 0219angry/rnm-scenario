import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { prisma } from "@/lib/prisma";
import { formSchema } from "@/lib/schemas";
import { fetchScenarios } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    let playedScenarioIds = new Set<string>();
    if (user) {
      const playedSessions = await prisma.session.findMany({
        where: { participants: { some: { userId: user.id } } },
        select: { scenarioId: true },
      });
      playedScenarioIds = new Set(playedSessions.map(session => session.scenarioId));
    }

    // 1. URLからsearchParamsを直接取得
    const { searchParams } = new URL(request.url);
        const paramsObj: Record<string, string | string[] | undefined> = {};
        for (const [key, value] of searchParams.entries()) {
          if (paramsObj[key]) {
            const existing = paramsObj[key];
            paramsObj[key] = Array.isArray(existing)
              ? [...existing, value]
              : [existing as string, value];
          } else {
            paramsObj[key] = value;
          }
        }

    // 2. searchParamsをそのまま関数に渡す
    const scenarios = await fetchScenarios(paramsObj);

    // 3. フラグを追加
    const scenariosWithPlayStatus = scenarios.map(scenario => ({
      ...scenario,
      isPlayed: playedScenarioIds.has(scenario.id),
    }));

    return NextResponse.json(scenariosWithPlayStatus);

  } catch (error) {
    console.error("Failed to fetch scenarios:", error);
    return new NextResponse(JSON.stringify({ message: "サーバーエラーが発生しました。" }), { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies(); 
    const sessionToken = cookieStore.get("sessionToken")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const session = await prisma.userSession.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await request.json();
    const validatedFields = formSchema.safeParse(body);

    if (!validatedFields.success) {
      return new NextResponse(JSON.stringify({ message: "入力内容に誤りがあります。", errors: validatedFields.error.flatten().fieldErrors }), { status: 400 });
    }

    const { title, playerMin, playerMax, requiresGM, genre, averageTime, distribution, priceMax, priceMin, isPublic, rulebookId, comment } = validatedFields.data;

    const newScenario = await prisma.scenario.create({
      data: {
        title,
        playerMin,
        playerMax,
        requiresGM,
        genre,
        averageTime,
        distribution: distribution || null,
        priceMax,
        priceMin,
        isPublic,
        rulebookId: rulebookId || null,
        content: comment || null,
        ownerId: userId,
      },
    });

    return new NextResponse(JSON.stringify(newScenario), { status: 201 });

  } catch (error) {
    console.error("Scenario creation error:", error);
    return new NextResponse(JSON.stringify({ message: "サーバーエラーが発生しました。" }), { status: 500 });
  }
}

