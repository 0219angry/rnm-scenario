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
   default: "調査手帖",
   template: "%s | 調査手帖",
 },
  description: "シナリオの保管・タグ付け、セッションのスケジュール共有、プレイ履歴の振り返りをスマートに。仲間と遊ぶ準備がもっと楽しくなる管理アプリ。",
  icons: {
    icon: '/favicon.ico',
  },
 openGraph: {
   type: 'website',
   locale: 'ja_JP',
   siteName: '調査手帖',
   title: '調査手帖',
   description: 'シナリオの保管・タグ付け、セッションのスケジュール共有、プレイ履歴の振り返りをスマートに。仲間と遊ぶ準備がもっと楽しくなる管理アプリ。',
 },
 twitter: {
   card: 'summary_large_image',
   title: '調査手帖',
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
            <Header />
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