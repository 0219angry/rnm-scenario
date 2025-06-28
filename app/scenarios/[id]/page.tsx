import { fetchScenarioById } from "@/lib/data";
import { notFound } from "next/navigation";
import { Genre } from "@prisma/client";

const genreMap = {
  [Genre.MADAMIS]: 'マダミス',
  [Genre.TRPG]: 'TRPG',
  [Genre.OTHER]: 'その他',
};

export default async function ScenarioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scenario = await fetchScenarioById(id);
  console.log("Fetched scenario:", scenario);

  if (!scenario) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-4">{scenario.title}</h1>
        <div className="text-md text-gray-600 mb-6">
          <span>{genreMap[scenario.genre]}</span>
          {scenario.rulebook && <span> / {scenario.rulebook.name}</span>}
        </div>
        <div className="space-y-4 text-lg">
          <p><span className="font-semibold">プレイヤー数:</span> {scenario.playerMin}〜{scenario.playerMax}人</p>
          <p><span className="font-semibold">GM:</span> {scenario.requiresGM ? '必須' : '不要'}</p>
          <p><span className="font-semibold">所要時間:</span> {scenario.averageTime}分</p>
          {scenario.distribution && (
            <p><span className="font-semibold">配布先:</span> <a href={scenario.distribution} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{scenario.distribution}</a></p>
          )}
          {scenario.content && (
            <div className="pt-4 border-t mt-4">
              <h2 className="font-semibold text-xl mb-2">内容</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{scenario.content}</p>
            </div>
          )}
        </div>
        <div className="text-sm text-gray-500 mt-8 pt-4 border-t">
          作成者: {scenario.owner.name}
        </div>
      </div>
    </div>
  );
}
