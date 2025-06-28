import Link from "next/link";
import { fetchLatestScenarios, fetchUpcomingSessions } from "@/lib/data";
import { GenreTag } from "@/components/ui/GenreTag";
import { LocalDateTime } from "@/components/ui/LocalDateTime";

export default async function Home() {
  const newScenarios = await fetchLatestScenarios();
  const upcomingSessions = await fetchUpcomingSessions();

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
              <div key={scenario.id} className="border p-4 rounded-lg">
                <h3 className="text-lg font-bold">{scenario.title}</h3>
                <GenreTag genre={scenario.genre} linkable={false} />
                <p>人数: {scenario.playerMin === scenario.playerMax ? scenario.playerMin : `${scenario.playerMin}〜${scenario.playerMax}`}人</p>
                <p>GM: {scenario.requiresGM ? "必要" : "不要"}</p>
              </div>
            ))}
          </div>
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
              <li key={session.id} className="border-b py-2">
                <p className="font-bold">{session.scenario.title}</p>
                <p className="text-sm text-gray-600">
                  日時:{" "}
                  {/* ✅ new Date()やtoLocaleStringを直接使わず、新しいコンポーネントを呼び出す */}
                  <LocalDateTime
                    utcDate={session.scheduledAt}
                    formatStr="M月d日(E) HH:mm"
                  />
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
