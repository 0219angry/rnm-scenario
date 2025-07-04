import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { ThemeProvider } from "@/components/features/theme/ThemeProvider";
import { Toaster } from 'sonner';
import FloatingChatWidget from "@/components/features/chats/FloatingChatWidget";
import { getCurrentUser } from "@/lib/auth";

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "シナリオ管理アプリ",
  description: "マーダーミステリーやTRPGのシナリオとセッションを管理するアプリです。",
  icons: {
    icon: '/favicon.ico', // ← ここ！
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  // 🔽 チャット用のチャンネルIDを定義（実際のIDに置き換えてください）
  const supportChannelId = "ALLUSERCHANNEL";

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

        {/* 🔽 FloatingChatWidgetを配置 */}
        <FloatingChatWidget 
          channelId={supportChannelId}
          currentUser={user}
        />
      </body>
    </html>
  );
}