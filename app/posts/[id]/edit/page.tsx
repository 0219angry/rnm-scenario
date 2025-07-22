import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PostForm from '@/components/features/posts/PostForm';
import { updatePost } from '@/lib/actions/postActions';

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">記事の編集</h1>
      <PostForm post={post} action={updatePost} />
    </div>
  );
}