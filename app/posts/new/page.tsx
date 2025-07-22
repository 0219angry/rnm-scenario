import PostForm from '@/components/features/posts/PostForm';
import { createPost } from '@/lib/actions/postActions';

export default function NewPostPage() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">新規記事投稿</h1>
      <PostForm post={null} action={createPost} />
    </div>
  );
}