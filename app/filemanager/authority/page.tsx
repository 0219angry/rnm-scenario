import Link from 'next/link';
import { FiLock, FiArrowLeft } from 'react-icons/fi'; // アイコン表示用のライブラリ

export default async function UnauthorizedPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string }>;
}) {
  const { sessionId } = await searchParams;
  return (
    <div className="flex min-h-[calc(100vh-160px)] flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
        
        {/* 鍵のアイコン */}
        <FiLock className="mx-auto h-16 w-16 text-gray-400" />

        {/* メインの見出し */}
        <h1 className="mt-6 text-2xl font-bold text-gray-800">
          アクセス権限がありません
        </h1>

        {/* 説明文 */}
        <p className="mt-2 text-gray-600">
          このページを表示するには、管理者（GM）などの特定の権限が必要です。
          権限についてご不明な点がある場合は、セッションの主催者にお問い合わせください。
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4">
          {/* ★ sessionId が存在する場合のみ、戻るボタンを表示 ★ */}
          {sessionId && (
            <Link href={`/sessions/${sessionId}`}> {/* セッション詳細ページのパスに合わせて要調整 */}
              <span className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-300">
                <FiArrowLeft />
                セッションページに戻る
              </span>
            </Link>
          )}
          

          {/* トップページへ戻るボタン */}
          <Link href="/">
            <span className="mt-8 inline-block rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600">
              トップページに戻る
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}