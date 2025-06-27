import { fetchScenarioById } from "@/lib/data";
import { notFound } from "next/navigation";
import { Genre } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { GenreTag } from "@/components/ui/GenreTag";

const genreMap = {
  [Genre.MADAMIS]: 'マダミス',
  [Genre.TRPG]: 'TRPG',
  [Genre.OTHER]: 'その他',
};

export default async function ScenarioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scenario = await fetchScenarioById(id);
  const currentUser = await getCurrentUser();
  console.log("Fetched scenario:", scenario);

  if (!scenario) {
    notFound();
  }

  const isOwner = currentUser && currentUser.id === scenario.ownerId;

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 relative">
        {/* ✅ 編集ボタン表示 */}
        {isOwner && (
          <Link
            href={`/scenarios/${scenario.id}/edit`}
            className="absolute top-4 right-4 text-sm text-blue-500 hover:underline"
          >
            ✏ 編集する
          </Link>
        )}

        <h1 className="text-3xl font-bold mb-4">{scenario.title}</h1>
        <div className="text-md text-gray-600 mb-6 flex items-center gap-2">
          <GenreTag genre={scenario.genre} />
          {scenario.rulebook && <span className="text-gray-700">/ {scenario.rulebook.name}</span>}
        </div>

        <div className="space-y-4 text-lg">
          <p><span className="font-semibold">プレイヤー数:</span> {scenario.playerMin === scenario.playerMax ? scenario.playerMin : `${scenario.playerMin}〜${scenario.playerMax}`}人</p>
          <p><span className="font-semibold">GM:</span> {scenario.requiresGM ? "必須" : "不要"}</p>
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

        <div className="text-sm text-gray-500 mt-8 pt-4 border-t flex items-center gap-2">
          <span className="font-semibold">作成者:</span>
          {/* ユーザアイコンと名前 */}
          <img
            src={scenario.owner.image ?? `https://avatar.vercel.sh/${scenario.owner.id}`}
            alt="ユーザアイコン"
            className="w-6 h-6 rounded-full object-cover"
          />
          <Link
            href={`/${scenario.owner.username ?? scenario.owner.id}`}
            className="text-blue-500 hover:underline"
          >
            {scenario.owner.name ?? scenario.owner.username}
          </Link>
        </div>
      </div>
    </div>
  );
}
