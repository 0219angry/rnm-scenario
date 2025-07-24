// app/posts/[id]/edit/page.tsx
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { updatePost } from '@/lib/actions/postActions';
import PostForm from '@/components/features/posts/PostForm'; // PostFormコンポーネントをインポート

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const { id } = params;

  // 投稿データと、それに関連するタグを取得
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      tags: true, // 👈 投稿に紐づくタグを取得
    },
  });

  // フォームの選択肢として使用する、全てのタグを取得
  const allTags = await prisma.postTag.findMany();

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* <h1 className="text-3xl font-bold mb-6">記事の編集</h1> */}
      <PostForm 
        post={post} 
        allTags={allTags} // 👈 全てのタグを渡す
        action={updatePost} 
      />
    </div>
  );
}