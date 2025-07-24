import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { LocalDateTime } from '@/components/ui/LocalDateTime';
import Link from 'next/link';
import Image from 'next/image';
import { TagBadge } from '@/components/ui/TagBadge'; // タグ表示用の
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
// import 'highlight.js/styles/github.css'; // お好みのテーマに変更可！


export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, image: true } },
      tags: { select: { name: true, color: true } },
    },
  });
  console.log("Fetched post:", post?.content);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {post.tags && post.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {post.tags.map((tag) => (
            <TagBadge key={tag.name} name={tag.name} color={tag.color} />
          ))}
        </div>
      )}
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
        {post.title}
      </h1>
      <div className="flex flex-wrap items-center justify-between gap-y-4 mb-8 border-b border-t border-gray-200 dark:border-gray-700 py-4">
        <div className="flex items-center gap-x-4">
          <Image src={post.author?.image ?? `https://avatar.vercel.sh/${post.author?.id}`} alt={post.author?.name || '著者アバター'} width={40} height={40} className="rounded-full bg-gray-100" />
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{post.author?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400"><LocalDateTime utcDate={post.createdAt} formatStr="y/MM/dd" /></p>
          </div>
        </div>
        <Link href={`/posts/${id}/edit`} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
          編集する
        </Link>
      </div>
      <p className="text-gray-600 mb-8">
        <LocalDateTime
          utcDate={post.createdAt}
          formatStr="Y年M月d日(E) HH:mm"
        />
      </p>
      <div className="markdown-body bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {post.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}