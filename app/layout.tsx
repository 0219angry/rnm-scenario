import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "シナリオ管理アプリ",
  description: "マーダーミステリーやTRPGのシナリオとセッションを管理するアプリです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJp.variable} font-sans antialiased`}>
        <div className="flex flex-col min-h-screen">
          <header className="bg-gray-800 text-white p-4">
            <div className="container mx-auto">
              <h1 className="text-xl font-bold">シナリオ管理</h1>
            </div>
          </header>
          <main className="flex-grow container mx-auto p-4">
            {children}
          </main>
          <footer className="bg-gray-200 p-4 text-center">
            <p>© 2025 シナリオ管理</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
