import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export default async function UsersPage() {
  // ✅ 1. 全ユーザーのデータを取得する
  const users = await prisma.user.findMany({
    // usernameがnullでないユーザーのみを対象
    where: {
      username: { not: null },
    },
    // ユーザー名で昇順に並び替え
    orderBy: {
      username: "asc",
    },
  });

  return (
    <main className="container mx-auto mt-12 max-w-5xl px-4">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-8">
        ユーザー一覧
      </h1>

      {/* ✅ 2. ユーザーリストをグリッドレイアウトで表示 */}
      {users.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {users.map((user) => (
            // ✅ 3. 各ユーザーをプロフィールページへリンクする
            <Link 
              href={`/${user.username}`} 
              key={user.id} 
              className="block rounded-lg bg-white dark:bg-gray-800 p-4 text-center shadow transition hover:shadow-lg hover:-translate-y-1"
            >
              <Image
                src={user.image ?? `https://avatar.vercel.sh/${user.id}`}
                alt={user.name ?? "プロフィール画像"}
                width={96}
                height={96}
                className="h-24 w-24 mx-auto rounded-full object-cover ring-4 ring-white"
              />
              <div className="mt-3">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {user.name ?? user.username}
                </h2>
                <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                  @{user.username}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">登録されているユーザーはいません。</p>
      )}
    </main>
  );
}