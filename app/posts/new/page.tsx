// app/posts/new/page.tsx
import { prisma } from '@/lib/prisma';
import PostForm from '@/components/features/posts/PostForm';
import { createPost } from '@/lib/actions/postActions';

// async関数に変更
export default async function NewPostPage() {
  // 全てのタグを取得
  const allTags = await prisma.postTag.findMany();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* <h1 className="text-3xl font-bold mb-6">新規記事投稿</h1> */}
      <PostForm 
        post={null} 
        allTags={allTags} // 取得した全タグを渡す
        action={createPost} 
      />
    </div>
  );
}