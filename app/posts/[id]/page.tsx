import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { LocalDateTime } from '@/components/ui/LocalDateTime';
import ReactMarkdown from 'react-markdown';

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-600 mb-8">
        <LocalDateTime
          utcDate={post.createdAt}
          formatStr="Y年M月d日(E) HH:mm"
        />
      </p>
      <div className="prose lg:prose-xl">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </div>
  );
}