import { GenreTag } from '@/components/ui/GenreTag';
import { GmTag } from '@/components/ui/GmTag'; // ✅ GmTagコンポーネントをインポート
import { Scenario, Rulebook, User } from '@prisma/client';
import Link from 'next/link';
import { FlagIcon } from '@heroicons/react/24/solid';

// isPlayedプロパティを追加
export type ScenarioWithRelations = Scenario & {
  rulebook: Rulebook | null;
  owner: User;
  isPlayed?: boolean; // プレイ済みフラグ (オプショナル)
};

export default function ScenarioCard({ scenario }: { scenario: ScenarioWithRelations }) {
  return (
    // カード全体を相対位置の基準にする
    <div className="relative h-full">
      <Link href={`/scenarios/${scenario.id}`} className="block h-full rounded-lg border bg-white dark:bg-gray-800 transition hover:shadow-lg">
        <div className="flex h-full flex-col p-4">
          <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-100 truncate pr-8"> {/* アイコンと重ならないように右に余白 */}
            {scenario.title}
          </h3>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <GenreTag genre={scenario.genre} />
            <GmTag requiresGM={scenario.requiresGM} />
          </div>
          
          <div className="text-sm text-gray-600 mb-2 dark:text-gray-300">
            {scenario.rulebook && <span>ルールブック: {scenario.rulebook.name}</span>}
          </div>

          <div className="text-sm text-gray-800 dark:text-gray-300 space-y-1 mb-4 flex-grow">
            <p>プレイヤー数: {scenario.playerMin === scenario.playerMax ? scenario.playerMin : `${scenario.playerMin}〜${scenario.playerMax}`}人</p>
            <p>所要時間: {scenario.averageTime}分程度</p>
          </div>
          
          <div className="text-xs text-gray-500 mt-auto pt-2 border-t dark:text-gray-400">
            作成者: {scenario.owner.name ?? scenario.owner.username}
          </div>
        </div>
      </Link>
      
      {/* ★ 既プレイの場合に旗マークを表示 */}
      {scenario.isPlayed && (
        <div className="absolute top-3 right-3 text-red-500" title="プレイ済み">
          <FlagIcon className='h-5 w-5' />
        </div>
      )}
    </div>
  );
}