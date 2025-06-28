import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { UserMenu } from "./UserMenu";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        {/* 左側：ロゴ＋ジャンル別シナリオ */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-xl font-bold text-gray-800">
            RNM Scenario
          </Link>

          <div className="flex items-center space-x-4 text-sm text-gray-700">
            <Link href="/scenarios?genre=MADAMIS" className="hover:text-blue-500">マダミス</Link>
            <Link href="/scenarios?genre=TRPG" className="hover:text-blue-500">TRPG</Link>
            <Link href="/users" className="hover:text-blue-500">メンバー</Link>
          </div>
        </div>

        {/* 右側：セッション＋ユーザーメニュー */}
        <div className="flex items-center space-x-4 text-sm">
          <Link href="/sessions" className="text-gray-800 hover:text-blue-500">
            セッション一覧
          </Link>
          {user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <Link href="/signin" className="text-gray-800 hover:text-blue-500">
                ログイン
              </Link>
              <Link
                href="/signup"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                新規登録
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}