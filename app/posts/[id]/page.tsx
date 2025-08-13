// app/posts/[id]/page.tsx
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { LocalDateTime } from '@/components/ui/LocalDateTime';
import Link from 'next/link';
import Image from 'next/image';
import { TagBadge } from '@/components/ui/TagBadge';
import { getCurrentUser } from '@/lib/auth';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

// シンタックスハイライト用のCSS（お好みのテーマに）
import 'highlight.js/styles/github-dark.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    select: { title: true, summary: true, id: true, createdAt: true, updatedAt: true },
  });
  if (!post) return {};

  const base = process.env.NEXT_PUBLIC_SITE_URL;
  const url = new URL(`/posts/${post.id}`, base);
  const qs = new URLSearchParams({
    title: post.title,
    site: 'シナリオ管理アプリ',
    desc: post.summary ?? '',
    accent: '#3b82f6', // 好きなブランド色にしてねっ
    v: String(post.updatedAt?.getTime?.() ?? Date.now()), // キャッシュ破り
  });
  const ogImage = new URL(`/api/og/post?${qs.toString()}`, base);
  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      url: url.toString(),
      images: [
        { url: ogImage.toString(), width: 1200, height: 630, type: 'image/png' },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: [ogImage.toString()],
    },
  };
 }

// ページコンポーネントのPropsの型定義を修正
export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, image: true } },
      tags: { select: { name: true, color: true } },
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      {/* タグ表示 */}
      {post.tags && post.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {post.tags.map((tag) => (
            <TagBadge key={tag.name} name={tag.name} color={tag.color} />
          ))}
        </div>
      )}

      {/* タイトル */}
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
        {post.title}
      </h1>

      {/* 著者・日付・編集ボタンエリア */}
      <div className="flex flex-wrap items-center justify-between gap-y-4 mb-8 border-b border-t border-gray-200 dark:border-gray-700 py-4">
        <div className="flex items-center gap-x-4">
          <Image
            src={post.author?.image ?? `https://avatar.vercel.sh/${post.author?.id}`}
            alt={post.author?.name || '著者アバター'}
            width={40}
            height={40}
            className="rounded-full bg-gray-100"
          />
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {post.author?.name}
            </p>
            {/* 👇 日付表示をこちらに集約し、詳細なフォーマットに */}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <LocalDateTime
                utcDate={post.createdAt}
                formatStr="y年MM月dd日(E) HH:mm"
              />
            </p>
          </div>
        </div>

        {/* ログインユーザーが著者本人の場合のみ編集ボタンを表示 */}
        {user && user.id === post.author?.id && (
          <Link
            href={`/posts/${post.id}/edit`}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            編集する
          </Link>
        )}
      </div>
      
      {/* Markdown本文 */}
      <div className="markdown-body dark:markdown-body bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
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