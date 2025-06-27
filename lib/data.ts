import { prisma } from '@/lib/prisma';
import { Genre, Prisma } from '@prisma/client';

/**
 * URLの検索パラメータの型定義
 */
export type ScenarioSearchParams = {
  genre?: string;
  player_num?: string;
  gm?: 'required' | 'optional' | '';
};

/**
 * 文字列がPrismaのGenre enumに存在するかをチェックする型ガード
 * @param genre チェックする文字列
 * @returns Genre型であればtrue、そうでなければfalse
 */
function isValidGenre(genre: any): genre is Genre {
  return Object.values(Genre).includes(genre);
}

/**
 * 検索条件に基づいてシナリオを取得する
 * @param searchParams URLから受け取った検索パラメータ
 * @returns 条件に一致するシナリオの配列
 */
export async function fetchScenarios(searchParams: ScenarioSearchParams) {
  const { genre, player_num, gm } = searchParams;

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