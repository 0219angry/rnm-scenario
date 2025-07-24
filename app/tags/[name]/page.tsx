import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma'; // PrismaClientのインスタンスをインポート
import { LocalDateTime } from '@/components/ui/LocalDateTime'; // 日付表示コンポーネント

type Props = {
  params: {
    // ディレクトリ名 [name] に対応
    name: string; 
  };
};

// 1. ビルド時に静的なページを生成する（推奨）
export async function generateStaticParams() {
  const tags = await prisma.postTag.findMany({
    select: { name: true },
  });

  // { name: 'react' }, { name: 'nextjs' } のような配列を返す
  return tags.map((tag) => ({
    name: encodeURIComponent(tag.name),
  }));
}

// 2. ページのメインコンポーネント
export default async function TagPage({ params }: Props) {
  // URLのタグ名はエンコードされている可能性があるのでデコードする
  const tagName = decodeURIComponent(params.name);

  // 3. Prismaでタグと、そのタグに紐づく記事を取得
  const tagWithPosts = await prisma.postTag.findUnique({
    where: {
      name: tagName,
    },
    include: {
      // リレーションを辿って関連する投稿を全て取得
      posts: {
        // さらに投稿者情報も一緒に取得
        include: {
          author: true,
        },
        orderBy: {
          createdAt: 'desc', // 新しい順に並び替え
        },
      },
    },
  });

  // 4. タグが見つからなければ404ページを表示
  if (!tagWithPosts) {
    notFound();
  }
  
  // 5. 取得したデータを表示
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">
        タグ: 
        <span 
          style={{ color: tagWithPosts.color }} 
          className="ml-2 px-2 py-1 rounded"
        >
          {tagWithPosts.name}
        </span>
      </h1>

      <div className="space-y-6">
        {tagWithPosts.posts.length > 0 ? (
          tagWithPosts.posts.map((post) => (
            <article key={post.id} className="border-b pb-4 dark:border-gray-700">
              <h2 className="text-2xl font-semibold hover:underline">
                <Link href={`/posts/${post.id}`}>{post.title}</Link>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{post.summary}</p>
              <div className="text-sm text-gray-500 mt-2">
                <span>{post.author.name}</span>
                <span className="mx-2">•</span>
                <span><LocalDateTime utcDate={post.createdAt} formatStr="y/MM/dd" /></span>
              </div>
            </article>
          ))
        ) : (
          <p>このタグが付いた記事はまだありません。</p>
        )}
      </div>
    </div>
  );
}