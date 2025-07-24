import Link from "next/link";
import { fetchLatestScenarios, fetchUpcomingSessions, fetchLatestPosts } from "@/lib/data";
import { GenreTag } from "@/components/ui/GenreTag";
import { LocalDateTime } from "@/components/ui/LocalDateTime";
import { GmTag } from "@/components/ui/GmTag";
import { TagBadge } from "@/components/ui/TagBadge";

export default async function Home() {
  const newScenarios = await fetchLatestScenarios();
  const upcomingSessions = await fetchUpcomingSessions();
  const latestPosts = await fetchLatestPosts(); 

  return (
    <div className="container mx-auto p-6 space-y-12">

      {/* 🔹 新着シナリオセクション */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">新着シナリオ</h2>
          <Link href="/scenarios" className="text-blue-500 hover:underline text-sm">
            すべて見る →
          </Link>
        </div>
        {newScenarios.length === 0 ? (
          <p className="text-gray-500">まだシナリオが登録されていません…！</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {newScenarios.map((scenario) => (
              <Link key={scenario.id} href={`/scenarios/${scenario.id}`}>
                <div className="border p-4 rounded-lg">
                  <h3 className="text-lg font-bold">{scenario.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <GenreTag genre={scenario.genre} /> {/* 👈 linkableを削除 */}
                    <GmTag requiresGM={scenario.requiresGM} />
                  </div>
                  <p>人数: {scenario.playerMin === scenario.playerMax ? scenario.playerMin : `${scenario.playerMin}〜${scenario.playerMax}`}人</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">新着記事</h2>
          <Link href="/posts" className="text-blue-500 hover:underline text-sm">
            すべて見る →
          </Link>
        </div>
        {latestPosts.length === 0 ? (
          <p className="text-gray-500">まだ記事が投稿されていません…！</p>
        ) : (
          <ul className="space-y-4">
            {latestPosts.map((post) => (
              <li key={post.id} className="border-b pb-3 dark:border-gray-700">
                <Link href={`/posts/${post.id}`} className="group">
                  <h3 className="text-lg font-semibold group-hover:underline">
                    {post.title}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>{post.author.name}</span>
                  <span className="mx-1">•</span>
                  <LocalDateTime
                    utcDate={post.createdAt}
                    formatStr="M月d日"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {post.tags.map((tag) => (
                    <TagBadge key={tag.name} name={tag.name} color={tag.color} />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 🔸 セッション予定セクション */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">セッション予定</h2>
          <Link href="/sessions" className="text-blue-500 hover:underline text-sm">
            一覧を見る →
          </Link>
        </div>
        {upcomingSessions.length === 0 ? (
          <p className="text-gray-500">まだ予定されているセッションはありません…！</p>
        ) : (
          <ul>
            {upcomingSessions.map((session) => (
              <Link key={session.id} href={`/sessions/${session.id}`}>
                <li className="border-b py-2">
                  <p className="font-bold">{session.title} - {session.scenario.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    日時:{" "}
                    {/* ✅ new Date()やtoLocaleStringを直接使わず、新しいコンポーネントを呼び出す */}
                    <LocalDateTime
                      utcDate={session.scheduledAt}
                      formatStr="M月d日(E) HH:mm"
                    />
                  </p>
                </li>
              </Link>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
