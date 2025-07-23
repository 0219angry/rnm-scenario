// app/posts/page.tsx
import { prisma } from '@/lib/prisma';
import { LocalDateTime } from '@/components/ui/LocalDateTime';
import Link from 'next/link';
import Image from 'next/image'; // Imageコンポーネントをインポート

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    // 投稿に紐づく著者情報も一緒に取得する
    include: {
      author: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">記事一覧</h1>
      <div className="flex flex-col gap-y-4">
        {posts?.map((post) => (
          <Link href={`/posts/${post.id}`} key={post.id} className="group block">
            <div className="bg-white rounded-lg p-6 border border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-indigo-500">
              <h2 className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 mb-3">
                {post.title}
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                {post.summary}
              </p>

              {/* ===== 著者情報と日付のエリア ===== */}
              <div className="mt-4 flex items-center justify-between">
                {/* 著者アイコンと名前 */}
                <div className="flex items-center gap-x-3">
                  <Image
                    // 著者の画像がない場合のフォールバック画像
                    src={post.author?.image ?? `https://avatar.vercel.sh/${post.authorId}`}
                    alt={post.author?.name || '著者アバター'}
                    width={32}
                    height={32}
                    className="rounded-full bg-gray-100"
                  />
                  <p className="text-sm font-medium text-gray-700">
                    {post.author?.name}
                  </p>
                </div>

                {/* 日付 */}
                <p className="text-gray-500 text-xs">
                  <LocalDateTime
                    utcDate={post.createdAt}
                    formatStr="Y/M/d"
                  />
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}