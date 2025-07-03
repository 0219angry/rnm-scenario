import { GenreTag } from '@/components/ui/GenreTag';
import { Scenario, Rulebook } from '@prisma/client';

type ScenarioInfoCardProps = {
  scenario: Scenario & { rulebook: Rulebook | null };
};

export function ScenarioInfoCard({ scenario }: ScenarioInfoCardProps) {
  return (
    <section>
      <h2 className="font-semibold text-xl mb-4">📘 シナリオ情報</h2>
      <div className="space-y-4 text-lg bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
        <p><span className="font-semibold">タイトル:</span> {scenario.title}</p>
        <p className="flex items-center gap-2">
          <span className="font-semibold">ジャンル:</span> <GenreTag genre={scenario.genre} />
          {scenario.rulebook && <span className="text-gray-500 dark:text-gray-300 text-base">/ {scenario.rulebook.name}</span>}
        </p>
        <p><span className="font-semibold">プレイヤー数:</span> {scenario.playerMin === scenario.playerMax ? scenario.playerMin : `${scenario.playerMin}〜${scenario.playerMax}`}人</p>
        <p><span className="font-semibold">GM:</span> {scenario.requiresGM ? "必須" : "不要"}</p>
        <p><span className="font-semibold">所要時間:</span> {scenario.averageTime}分程度</p>
        {scenario.distribution && (
          <p><span className="font-semibold">配布先:</span> <a href={scenario.distribution} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{scenario.distribution}</a></p>
        )}
      </div>
      {scenario.content && (
        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-2">📄 シナリオの内容</h3>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
            <p className="text-gray-800 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{scenario.content}</p>
          </div>
        </div>
      )}
    </section>
  );
}