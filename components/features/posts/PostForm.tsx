'use client';

import { useState } from 'react';
import { Post } from '@prisma/client';
// Markdownエディタをインポート
import SimpleMdeReact from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css'; // エディタのスタイルをインポート

type PostFormProps = {
  post: Post | null;
  action: (formData: FormData) => Promise<void>;
};

export default function PostForm({ post, action }: PostFormProps) {
  const [content, setContent] = useState(post?.content || '');

  return (
    // フォーム全体をカード化
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
        {post ? '記事を編集' : '新しい記事を作成'}
      </h2>
      <form action={action}>
        {post && <input type="hidden" name="id" value={post.id} />}
        
        <div className="mb-6">
          <label htmlFor="title" className="block text-lg font-semibold text-gray-700 mb-2">
            タイトル
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            defaultValue={post?.title}
            // スタイルを調整して見やすく
            className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200"
            placeholder="記事のタイトルを入力..."
          />
        </div>
        
        <div className="mb-8">
          <label htmlFor="content" className="block text-lg font-semibold text-gray-700 mb-2">
            本文
          </label>
          {/* textareaをMarkdownエディタに置き換え */}
          <div className="prose max-w-none">
            <SimpleMdeReact id="content" value={content} onChange={setContent} />
          </div>
          {/* Server Actionに値を渡すためのhiddenフィールド */}
          <input type="hidden" name="content" value={content} />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 py-3 px-6 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-transform hover:scale-105"
          >
            {post ? '更新する' : '投稿する'}
          </button>
        </div>
      </form>
    </div>
  );
}
