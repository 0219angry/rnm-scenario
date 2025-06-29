import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { LocalDateTime } from "@/components/ui/LocalDateTime";
import { SessionFilterForm } from "@/components/features/sessions/SessionFilterForm";

export default async function SessionListPage({
    searchParams 
  }: {
    searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const { title, owner, status } = await searchParams;

  const where: any = {};
  if (title) {
    where.scenario = { title: { contains: title } };
  }
  if (owner) {
    where.owner = { name: { contains: owner } };
  }
  if (status === "upcoming") {
    where.scheduledAt = { gte: new Date() };
  } else if (status === "past") {
    where.scheduledAt = { lt: new Date() };
  }

  const sessions = await prisma.session.findMany({
    where,
    include: { scenario: true, owner: true },
    orderBy: { scheduledAt: "desc" },
  });

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">セッション一覧</h1>
        <Link href="/sessions/new" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          新規セッション作成
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4">
          <SessionFilterForm />
        </aside>

        <section className="w-full md:w-3/4">
          {sessions.length === 0 ? (
            <p className="text-gray-500">該当するセッションはありませんでした…！</p>
          ) : (
            <ul className="space-y-4">
              {sessions.map((session) => (
                <li key={session.id} className="rounded-lg bg-white dark:bg-gray-800 shadow transition hover:shadow-lg">
                  <Link href={`/sessions/${session.id}`} className="block p-4">
                      <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
                        {session.title ?? "セッション名未設定"}
                      </div>
                    <div className="text-sm text-gray-600 dark:text-gray-100 mt-1">
                       <p className="text-sm text-gray-600 dark:text-gray-100">
                            📅 日時:{" "}
                            {/* ✅ new Date()やtoLocaleStringを直接使わず、新しいコンポーネントを呼び出す */}
                            <LocalDateTime
                              utcDate={session.scheduledAt}
                              formatStr="M月d日(E) HH:mm"
                            />
                          </p>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      🎲 シナリオ: {session.scenario?.title ?? "シナリオ未設定"} / 🎤 主催者: {session.owner?.name ?? "不明"}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}


