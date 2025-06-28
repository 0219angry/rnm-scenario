import { GenreTag } from '@/components/ui/GenreTag';
import { Scenario, Rulebook, User } from '@prisma/client';
import Link from 'next/link';

type ScenarioWithRelations = Scenario & {
  rulebook: Rulebook | null;
  owner: User;
};

export default function ScenarioCard({ scenario }: { scenario: ScenarioWithRelations }) {
  return (
    <Link href={`/scenarios/${scenario.id}`} className="block h-full hover:shadow-md transition-shadow">
      <div className="border rounded-lg p-4 flex flex-col h-full">
        <h3 className="text-lg font-bold mb-2">
          {scenario.title}
        </h3>
        <div className="text-sm text-gray-600 mb-2">
          <GenreTag genre={scenario.genre} linkable={true} />
          {scenario.rulebook && <span> / {scenario.rulebook.name}</span>}
        </div>
        <div className="text-sm text-gray-800 space-y-1 mb-4 flex-grow">
          <p>プレイヤー数: {scenario.playerMin===scenario.playerMax ? scenario.playerMin : `${scenario.playerMin}〜${scenario.playerMax}`}人</p>
          <p>GM: {scenario.requiresGM ? '必須' : '不要'}</p>
          <p>所要時間: {scenario.averageTime}分</p>
        </div>
        <div className="text-xs text-gray-500 mt-auto pt-2 border-t">
          作成者: {scenario.owner.name}
        </div>
      </div>
    </Link>
  );
}