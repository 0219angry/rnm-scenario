import { prisma } from '@/lib/prisma';
import { Genre, Prisma } from '@prisma/client';

/**
 * URLの検索パラメータの型定義
 */
type NextSearchParams = { [key:string]: string | string[] | undefined };

/**
 * 文字列がPrismaのGenre enumに存在するかをチェックする型ガード
 * @param genre チェックする文字列
 * @returns Genre型であればtrue、そうでなければfalse
 */
function isValidGenre(genre: string): genre is Genre {
  return Object.values(Genre).includes(genre as Genre);
}

/**
 * 検索条件に基づいてシナリオを取得する
 * @param searchParams URLから受け取った検索パラメータ
 * @returns 条件に一致するシナリオの配列
 */
export async function fetchScenarios(searchParams: NextSearchParams) {
  // ★ 配列の可能性を考慮して、値を取り出す
  const genre = Array.isArray(searchParams.genre) ? searchParams.genre[0] : searchParams.genre;
  const player_num = Array.isArray(searchParams.player_num) ? searchParams.player_num[0] : searchParams.player_num;
  const gm = Array.isArray(searchParams.gm) ? searchParams.gm[0] : searchParams.gm;

  const where: Prisma.ScenarioWhereInput = {};

  // genre パラメータが有効な値の場合のみ条件に追加
  if (genre && isValidGenre(genre)) {
    where.genre = genre;
  }

  // player_num パラメータを解釈して条件に追加
  if (player_num) {
    const num = parseInt(player_num, 10);
    // 数字であり、0より大きい場合のみ適用
    if (!isNaN(num) && num > 0) {
      where.playerMin = { lte: num };
      where.playerMax = { gte: num };
    }
  }

  // gm パラメータに基づいて条件に追加
  if (gm === 'required') {
    where.requiresGM = true;
  } else if (gm === 'optional') {
    where.requiresGM = false;
  }

  try {
    const scenarios = await prisma.scenario.findMany({
      where,
      include: {
        rulebook: true,
        owner: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return scenarios;
  } catch (error) {
    console.error('Failed to fetch scenarios:', error);
    // エラーが発生した場合は空の配列を返すか、エラーをスローする
    return [];
  }
}

export async function fetchScenarioById(id: string) {
  console.log("Fetching scenario with ID:", id);
  return await prisma.scenario.findUnique({
    where: { id },
    include: {
      rulebook: true,
      owner: true,
    },
  });
}

export async function fetchSessionById(id: string) {
  console.log("Fetching session with ID:", id);
  return await prisma.session.findUnique({
    where: { id },
    include: {
      scenario: true, // シナリオのタイトル表示用
      owner: true, // セッションのオーナー情報
    },
  });
}

export async function fetchLatestScenarios(limit = 4) {
  return await prisma.scenario.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function fetchUpcomingSessions(limit = 2) {
  const today = new Date();
  today.setDate(today.getDate() - 1); // 今日以降のセッションを取得
  return await prisma.session.findMany({
    orderBy: { scheduledAt: "asc" },
    where: {
      scheduledAt: {
        gte: today,
      },
    },
    take: limit,
    include: {
      scenario: true, // シナリオのタイトル表示用
    },
  });
}