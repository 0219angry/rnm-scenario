'use client';

import { useState } from 'react';
import { Post } from '@prisma/client';

type PostFormProps = {
  // 編集時には既存の投稿データを、新規作成時にはnullを受け取る
  post: Post | null;
  // フォームが実行するServer Action
  action: (formData: FormData) => Promise<void>;
};

export default function PostForm({ post, action }: PostFormProps) {
  // 本文のState。編集時は初期値を設定
  const [content, setContent] = useState(post?.content || '');

  return (
    <form action={action}>
      {/* 編集時にはIDをhiddenフィールドとして含める */}
      {post && <input type="hidden" name="id" value={post.id} />}
      
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          タイトル
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          // 編集時は初期値を設定
          defaultValue={post?.title}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          本文
        </label>
        <textarea
          id="content"
          name="content"
          rows={15}
          required
          // 本文はStateで管理
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      
      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        {/* ボタンのテキストを動的に変更 */}
        {post ? '更新する' : '投稿する'}
      </button>
    </form>
  );
}