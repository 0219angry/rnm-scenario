// app/posts/page.tsx
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">記事一覧</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts?.map((post) => (
          <Link href={`/posts/${post.id}`} key={post.id} className="group h-full">
            {/* カード全体を高さ100%にして、中のflex-growを有効にする */}
            <div className="bg-white rounded-xl shadow-md h-full flex flex-col transition-shadow duration-300 group-hover:shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {post.title}
              </h2>
              {/* flex-growでこの要素が可能な限り高さを広げる */}
              <p className="text-gray-600 text-sm mb-4 flex-grow">
                {post.content?.substring(0, 100)}...
              </p>
              {/* mt-autoは不要になり、日付は本文のすぐ下に配置される */}
              <p className="text-gray-500 text-xs">
                {new Date(post.createdAt).toLocaleDateString('ja-JP')}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}