// app/posts/page.tsx
import {prisma} from '@/lib/prisma'; 
import Link from 'next/link';

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">記事一覧</h1>
      <div className="grid gap-4">
        {posts?.map((post) => (
          <Link href={`/posts/${post.id}`} key={post.id}>
            <div className="p-4 border rounded-lg hover:bg-gray-50">
              <h2 className="text-xl font-semibold">{post.title}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}