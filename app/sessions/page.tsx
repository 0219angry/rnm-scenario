import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { LocalDateTime } from "@/components/ui/LocalDateTime";

export default async function SessionListPage() {
  const sessions = await prisma.session.findMany({
    include: {
      scenario: true,
      owner: true,
    },
    orderBy: {
      scheduledAt: "desc",
    },
  });

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">セッション一覧</h1>
        <Link
          href="/sessions/new"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          新規セッション作成
        </Link>
      </div>

      {sessions.length === 0 ? (
        <p className="text-gray-500">まだセッションはありません…！</p>
      ) : (
        <ul className="space-y-4">
          {sessions.map((session) => (
            <li key={session.id} className="p-4 bg-white rounded-lg shadow-md">
              <Link href={`/sessions/${session.id}`}>
                <div className="text-lg font-semibold text-blue-600 hover:underline">
                  {session.title ?? "セッション名未設定"}
                </div>
              </Link>
              <div className="text-sm text-gray-600 mt-1">
                📅 <p className="text-sm text-gray-600">
                      日時:{" "}
                      {/* ✅ new Date()やtoLocaleStringを直接使わず、新しいコンポーネントを呼び出す */}
                      <LocalDateTime
                        utcDate={session.scheduledAt}
                        formatStr="M月d日(E) HH:mm"
                      />
                    </p>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                🎲 シナリオ: {session.scenario?.title ?? "シナリオ未設定"} / 🎤 主催者: {session.owner?.name ?? "不明"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
