import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { ThemeProvider } from "@/components/features/theme/ThemeProvider";
import { Toaster } from 'sonner';
import { getCurrentUser } from "@/lib/auth";

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
 metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com'),
 title: {
   default: "シナリオ管理アプリ",
   template: "%s | シナリオ管理アプリ",
 },
  description: "シナリオの保管・タグ付け、セッションのスケジュール共有、プレイ履歴の振り返りをスマートに。仲間と遊ぶ準備がもっと楽しくなる管理アプリ。",
  icons: {
    icon: '/favicon.ico',
  },
 openGraph: {
   type: 'website',
   locale: 'ja_JP',
   siteName: 'シナリオ管理アプリ',
   title: 'シナリオ管理アプリ',
   description: 'シナリオの保管・タグ付け、セッションのスケジュール共有、プレイ履歴の振り返りをスマートに。仲間と遊ぶ準備がもっと楽しくなる管理アプリ。',
 },
 twitter: {
   card: 'summary_large_image',
   title: 'シナリオ管理アプリ',
   description: 'シナリオの保管・タグ付け、セッションのスケジュール共有、プレイ履歴の振り返りをスマートに。仲間と遊ぶ準備がもっと楽しくなる管理アプリ。',
   creator: '@0219Angry',
 },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  console.log("CurrentUser in RootLayout:", user);


  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${notoSansJp.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <header className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
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

                  {/* サブタイトル：動詞をゴールド強調／本文はcurrentColor */}
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
            </header>
            <main className="flex-grow container mx-auto p-4">
              {children}
            </main>
            <footer className="bg-gray-200 dark:bg-gray-800 p-4 text-center">
            <p>© 2025 RNM</p>
          </footer>
          </div>
        </ThemeProvider>
        <Toaster richColors position="bottom-right" />


      </body>
    </html>
  );
}