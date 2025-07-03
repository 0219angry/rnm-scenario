import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";
import { RoleTag } from "@/components/ui/RoleTag";
import { GenreTag } from "@/components/ui/GenreTag";

// generateStaticParams は変更なし
export async function generateStaticParams() {
  const users = await prisma.user.findMany({
    where: { username: { not: null } },
    select: { username: true },
  });

  return users.map((user) => ({
    username: user.username!,
  }));
}

export default async function UserProfilePage({
  params,
}: {
  // paramsの型を修正
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  // ✅ ステップ1: データ取得を強化
  const user = await prisma.user.findUnique({
    where: { username },
    // 参加履歴と、それに関連するセッション、シナリオ情報を一度に取得
    include: {
      participations: {
        // 開催日が新しい順に並び替え
        orderBy: {
          session: {
            scheduledAt: 'desc',
          },
        },
        include: {
          session: {
            include: {
              scenario: true, // セッションに紐づくシナリオ情報
            },
          },
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // ✅ ステップ2: 累計プレイ数を計算
  const genreCounts = user.participations.reduce(
    (acc, participation) => {
      const genre = participation.session.scenario.genre;
      if (genre === "MADAMIS" && participation.session.isFinished) {
        acc.madamis++;
      } else if (genre === "TRPG" && participation.session.isFinished) {
        acc.trpg++;
      }
      return acc;
    },
    { madamis: 0, trpg: 0 }
  );

  const upcomingParticipations = user.participations.filter(
    (p) => !p.session.isFinished
  );
  const pastParticipations = user.participations.filter(
    (p) => p.session.isFinished
  );

  return (
    <main className="container mx-auto mt-12 max-w-4xl px-4">
      {/* --- プロフィールヘッダー --- */}
      <div className="flex flex-col items-center gap-6 rounded-xl bg-white dark:bg-gray-800 p-8 shadow-md md:flex-row">
        <Image
          src={user.image ?? `https://avatar.vercel.sh/${user.id}`}
          alt="プロフィール画像"
          width={128}
          height={128}
          className="h-32 w-32 flex-shrink-0 rounded-full object-cover ring-4 ring-sky-200"
        />
        <div className="text-center md:text-left w-full">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            {user.name ?? user.username}
          </h1>
          <p className="mt-1 text-lg font-semibold text-gray-500 dark:text-gray-400">
            @{user.username}
          </p>
          {user.bio && (
            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              {/* ✅ pタグからはボーダー関連のクラスを削除 */}
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {user.bio}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ✅ ステップ3: 累計数表示UI */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">プレイ記録</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
            <h3 className="text-lg font-semibold text-purple-800">マダミス</h3>
            <p className="mt-2 text-4xl font-bold text-purple-600">
              {genreCounts.madamis} <span className="text-xl font-medium">回</span>
            </p>
          </div>
          <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
            <h3 className="text-lg font-semibold text-green-800">TRPG</h3>
            <p className="mt-2 text-4xl font-bold text-green-600">
              {genreCounts.trpg} <span className="text-xl font-medium">回</span>
            </p>
          </div>
        </div>
      </div>

      {/* ✅ ステップ3: 参加履歴一覧UI */}
      <div className="mt-10 space-y-10">
        {/* --- 参加予定のセッション --- */}
        <div>
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">
            参加予定のセッション ({upcomingParticipations.length})
          </h2>
          {upcomingParticipations.length > 0 ? (
            <ul className="mt-4 space-y-4">
              {upcomingParticipations.map((p) => (
                // リストアイテムのコンポーネントは履歴と同じものを使用
                <li key={p.session.id} className="rounded-lg bg-white dark:bg-gray-800 shadow transition hover:shadow-lg">
                  {/* ✅ Linkコンポーネントで全体を囲み、レイアウトとパディングはこちらに適用 */}
                  <Link href={`/sessions/${p.session.id}`} className="block p-4">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {format(p.session.scheduledAt, "yyyy年MM月dd日", { locale: ja })}
                        </p>
                        <GenreTag genre={p.session.scenario.genre} />

                        {/* ✅ Linkではなくなり、通常のテキストとして表示。文字色を親要素に合わせる */}
                        <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                          {p.session.title || p.session.scenario.title}
                        </p>

                        {p.session.title && (
                            <p className="text-sm text-gray-700 dark:text-gray-300">シナリオ: {p.session.scenario.title}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0 self-center sm:self-auto"> {/* ✅ 中央揃えの微調整 */}
                        <RoleTag role={p.role} />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-center text-gray-500 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              参加予定のセッションはありません。
            </p>
          )}
        </div>

        {/* --- 参加履歴一覧 --- */}
        <div>
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">
            参加履歴 ({pastParticipations.length})
          </h2>
          {pastParticipations.length > 0 ? (
            <ul className="mt-4 space-y-4">
              {pastParticipations.map((p) => (
                <li key={p.session.id} className="rounded-lg bg-white dark:bg-gray-800 shadow transition hover:shadow-lg">
                  {/* ✅ Linkコンポーネントで全体を囲み、レイアウトとパディングはこちらに適用 */}
                  <Link href={`/sessions/${p.session.id}`} className="block p-4">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {format(p.session.scheduledAt, "yyyy年MM月dd日", { locale: ja })}
                        </p>
                        <GenreTag genre={p.session.scenario.genre} />

                        {/* ✅ Linkではなくなり、通常のテキストとして表示。文字色を親要素に合わせる */}
                        <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                          {p.session.title || p.session.scenario.title}
                        </p>

                        {p.session.title && (
                            <p className="text-sm text-gray-700 dark:text-gray-300">シナリオ: {p.session.scenario.title}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0 self-center sm:self-auto"> {/* ✅ 中央揃えの微調整 */}
                        <RoleTag role={p.role} />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-center text-gray-500 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              参加したセッションはまだありません。
            </p>
          )}
        </div>
      </div>
    </main>
  );
}