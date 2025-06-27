import { prisma } from '@/lib/prisma';
import { Genre, Prisma } from '@prisma/client';
import { Suspense } from 'react';
import ScenarioList from '@/components/features/scenarios/ScenarioList';
import ScenarioFilter from '@/components/features/scenarios/ScenarioFilter';

type SearchParams = {
  genre?: Genre;
  player_num?: string;
  gm?: 'required' | 'optional';
};

export default async function ScenariosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { genre, player_num, gm } = searchParams;

  const where: Prisma.ScenarioWhereInput = {};

  if (genre) {
    where.genre = genre;
  }

  if (player_num) {
    const num = parseInt(player_num, 10);
    if (!isNaN(num)) {
      where.playerMin = { lte: num };
      where.playerMax = { gte: num };
    }
  }

  if (gm === 'required') {
    where.requiresGM = true;
  } else if (gm === 'optional') {
    where.requiresGM = false;
  }

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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">シナリオ一覧</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4">
          <Suspense>
            <ScenarioFilter searchParams={searchParams} />
          </Suspense>
        </aside>
        <main className="w-full md:w-3/4">
          <Suspense fallback={<p>シナリオを読み込んでいます...</p>}>
            <ScenarioList scenarios={scenarios} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}