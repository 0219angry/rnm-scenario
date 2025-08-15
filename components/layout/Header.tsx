import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { UserMenu } from "./UserMenu";
import { ThemeSwitcher } from "@/components/features/theme/ThemeSwitcher";
import { NotificationMenu } from "@/components/ui/NotificationMenu";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        {/* 左側：ロゴ＋ジャンル別シナリオ */}
        <div className="flex items-center space-x-6">
          <Link
            href="/"
            className="text-gray-800 dark:text-gray-100 hover:opacity-90"
            aria-label="調査手帖 ホーム"
          >
            <svg
              width="180"
              height="40"
              viewBox="0 0 720 160"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-labelledby="t d"
            >
              <title id="t">調査手帖 ロゴ</title>
              <desc id="d">ノート＋虫眼鏡のシンボルに、動詞強調サブタイトル（テーマ連動配色）</desc>

              {/* アイコン（ベース＝currentColor／アクセント＝固定ゴールド） */}
              <g transform="translate(0,16)">
                <rect x="12" y="12" width="88" height="104" rx="16" fill="currentColor" opacity="0.95" />
                <rect x="12" y="12" width="12" height="104" fill="currentColor" opacity="0.75" />
                <circle cx="92" cy="92" r="26" fill="none" stroke="#C89F65" strokeWidth="8" />
                <line x1="110" y1="110" x2="128" y2="128" stroke="#C89F65" strokeWidth="8" strokeLinecap="round" />
                <path d="M88 20 h18 v26 l-9 -7 -9 7 z" fill="#C89F65" />
              </g>

              {/* ロゴタイプ */}
              <g transform="translate(168,0)">
                <text
                  x="0"
                  y="102"
                  fontFamily="'Noto Serif JP','Hiragino Mincho ProN','Yu Mincho',serif"
                  fontSize="64"
                  fill="currentColor"
                  fontWeight="600"
                >
                  調査手帖
                </text>
                <text
                  x="4"
                  y="136"
                  fontFamily="'Noto Sans JP','Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif"
                  fontSize="18"
                  fill="currentColor"
                  letterSpacing=".04em"
                >
                  <tspan fontWeight="700" fill="#C89F65">探す</tspan>、
                  <tspan fontWeight="700" fill="#C89F65">記す</tspan>、
                  <tspan fontWeight="700" fill="#C89F65">遊ぶ</tspan>。
                  すべてをひとつの手帖に。
                </text>
              </g>
            </svg>
            <span className="sr-only">調査手帖</span>
          </Link>

          <div className="flex items-center space-x-4 text-sm text-gray-700 dark:text-gray-300">
            <Link href="/scenarios?genre=MADAMIS" className="hover:text-blue-500 dark:hover:text-blue-400">マダミス</Link>
            <Link href="/scenarios?genre=TRPG" className="hover:text-blue-500 dark:hover:text-blue-400">TRPG</Link>
            <Link href="/users" className="hover:text-blue-500 dark:hover:text-blue-400">メンバー</Link>
            <Link href="/posts" className="hover:text-blue-500 dark:hover:text-blue-400">記事</Link>
          </div>
        </div>

        {/* 右側：セッション＋ユーザーメニュー */}
        <div className="flex items-center space-x-4 text-sm">
          <ThemeSwitcher />
          <Link href="/sessions?status=upcoming" className="text-gray-800 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
            セッション一覧
          </Link>
          {user && <NotificationMenu />} {/* 🔔 通知メニュー（ログイン時のみ） */}
          {user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <Link href="/signin" className="text-gray-800 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
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