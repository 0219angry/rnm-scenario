import { GenreTag } from '@/components/ui/GenreTag';
import { GmTag } from '@/components/ui/GmTag'; // ✅ GmTagコンポーネントをインポート
import { Scenario, Rulebook, User } from '@prisma/client';
import Link from 'next/link';

type ScenarioWithRelations = Scenario & {
  rulebook: Rulebook | null;
  owner: User;
};

export default function ScenarioCard({ scenario }: { scenario: ScenarioWithRelations }) {
  return (
    <Link href={`/scenarios/${scenario.id}`} className="block h-full rounded-lg border bg-white transition hover:shadow-lg">
      <div className="flex h-full flex-col p-4">
        <h3 className="text-lg font-bold mb-2 text-gray-800">
          {scenario.title}
        </h3>

        {/* ✅ ジャンルとGM要否のタグをまとめるセクション */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <GenreTag genre={scenario.genre} /> {/* 👈 linkableを削除 */}
          <GmTag requiresGM={scenario.requiresGM} />
        </div>
        
        <div className="text-sm text-gray-600 mb-2">
            {scenario.rulebook && <span>ルールブック: {scenario.rulebook.name}</span>}
        </div>

        <div className="text-sm text-gray-800 space-y-1 mb-4 flex-grow">
          <p>プレイヤー数: {scenario.playerMin === scenario.playerMax ? scenario.playerMin : `${scenario.playerMin}〜${scenario.playerMax}`}人</p>
          {/* ⚠️ 古いGM要否の表示は削除 */}
          <p>所要時間: {scenario.averageTime}分程度</p>
        </div>
        
        <div className="text-xs text-gray-500 mt-auto pt-2 border-t">
          作成者: {scenario.owner.name ?? scenario.owner.username}
        </div>
      </div>
    </Link>
  );
}