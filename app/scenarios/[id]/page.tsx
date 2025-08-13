import { fetchScenarioById } from "@/lib/data";
import { notFound } from "next/navigation";
import type { Metadata } from 'next';
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { GenreTag } from "@/components/ui/GenreTag";
import Image from "next/image";
import { GmTag } from "@/components/ui/GmTag";
import { RulebookHoverCard } from "@/components/features/rulebooks/RulebookHoverCard";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const scenario = await fetchScenarioById(id);
  if (!scenario) return {};

  const base = process.env.NEXT_PUBLIC_SITE_URL;
  const url = new URL(`/posts/${scenario.id}`, base);

  // 説明文：内容があれば先頭を、なければ要点を短く整形
  const metaDesc =
    (scenario.content?.trim() || '')
      .replace(/\s+/g, ' ')
     .slice(0, 120) ||
    `${scenario.genre}｜${scenario.playerMin === scenario.playerMax ? scenario.playerMin : `${scenario.playerMin}〜${scenario.playerMax}`}人｜${scenario.averageTime}分`;

  const qs = new URLSearchParams({
    title: scenario.title,
    site: 'シナリオ管理アプリ',
    desc: metaDesc,
    accent: '#3b82f6',
    v: String(scenario.updatedAt?.getTime?.() ?? Date.now()), // キャッシュ破り
  });
  const ogImage = new URL(`/api/og/post?${qs.toString()}`, base);

  return {
    title: scenario.title,
    description: metaDesc,
    openGraph: {
      title: scenario.title,
      description: metaDesc,
      url: url.toString(),
      images: [{ url: ogImage.toString(), width: 1200, height: 630, type: 'image/png' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: scenario.title,
      description: metaDesc,
      images: [ogImage.toString()],
    },
  };
}


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
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 relative">
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
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
          <GenreTag genre={scenario.genre} linkable={true} />
          <GmTag requiresGM={scenario.requiresGM} />
          {scenario.rulebook && (
              <span>
                / <RulebookHoverCard rulebook={scenario.rulebook} />
              </span>
            )}
        </div>

        <div className="space-y-4 text-lg">
          <p><span className="font-semibold">プレイヤー数:</span> {scenario.playerMin === scenario.playerMax ? scenario.playerMin : `${scenario.playerMin}〜${scenario.playerMax}`}人</p>
          <p><span className="font-semibold">所要時間:</span> {scenario.averageTime}分</p>
          <p><span className="font-semibold">価格:</span> {scenario.priceMin === scenario.priceMax ? scenario.priceMin : `${scenario.priceMin}〜${scenario.priceMax}`}円</p>
          {scenario.distribution && (
            <p><span className="font-semibold">配布先:</span> <a href={scenario.distribution} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{scenario.distribution}</a></p>
          )}
          {scenario.content && (
            <div className="pt-4 border-t mt-4">
              <h2 className="font-semibold text-xl mb-2">内容</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{scenario.content}</p>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400 mt-8 pt-4 border-t flex items-center gap-2">
          <span className="font-semibold">作成者:</span>
          {/* ユーザアイコンと名前 */}
          <Image
            width={32}
            height={32}
            src={scenario.owner.image ?? `https://avatar.vercel.sh/${scenario.owner.id}`}
            alt="User Icon"
            className="w-8 h-8 rounded-full"
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
