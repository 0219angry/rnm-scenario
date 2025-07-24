'use client';

import { useState } from 'react';
import { Post, PostTag } from '@prisma/client';
import SimpleMdeReact from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
// react-selectからCreatableSelectをインポート
import CreatableSelect from 'react-select/creatable';

type PostFormProps = {
  // 投稿データに関連するタグと、全ての既存タグをpropsで受け取る
  post: (Post & { tags: PostTag[] }) | null;
  allTags: PostTag[];
  action: (formData: FormData) => Promise<void>;
};

export default function PostForm({ post, allTags, action }: PostFormProps) {
  const [content, setContent] = useState(post?.content || '');

  // 既存の全タグをreact-selectで使える形式に変換
  const tagOptions = allTags.map((tag) => ({
    value: tag.name,
    label: tag.name,
  }));

  // 編集中の投稿に既についているタグをreact-selectの形式に変換
  const defaultTags = post?.tags.map((tag) => ({
    value: tag.name,
    label: tag.name,
  }));

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
        {post ? '記事を編集' : '新しい記事を作成'}
      </h2>
      <form action={action}>
        {post && <input type="hidden" name="id" value={post.id} />}

        {/* ...タイトルとサマリーの入力欄... */}
        <div className="mb-6">
          <label htmlFor="title" className="block text-lg font-semibold text-gray-700 mb-2">
            タイトル
          </label>
          <input type="text" id="title" name="title" required defaultValue={post?.title} className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200" placeholder="記事のタイトルを入力..." />
        </div>
        <div className="mb-6">
          <label htmlFor="summary" className="block text-lg font-semibold text-gray-700 mb-2">
            サマリー
          </label>
          <textarea id="summary" name="summary" rows={3} defaultValue={post?.summary || ''} className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200" placeholder="記事の簡単な要約（一覧ページなどで表示されます）" />
        </div>
        
        {/* ===== タグ入力欄を追加 ===== */}
        <div className="mb-6">
          <label htmlFor="tags" className="block text-lg font-semibold text-gray-700 mb-2">
            タグ
          </label>
          <CreatableSelect
            isMulti
            name="tags"
            options={tagOptions}
            defaultValue={defaultTags}
            classNamePrefix="select"
            className="mt-1 block w-full sm:text-sm"
            placeholder="タグを選択または入力してEnter..."
            // Tailwind CSSとデザインを合わせるためのスタイル
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: '#F9FAFB', // bg-gray-50
                borderRadius: '0.5rem', // rounded-lg
                borderColor: '#E5E7EB', // border-gray-200
                padding: '0.3rem',
                boxShadow: 'none',
                '&:hover': {
                  borderColor: '#E5E7EB',
                },
              }),
            }}
          />
        </div>

        <div className="mb-8">
          <label htmlFor="content" className="block text-lg font-semibold text-gray-700 mb-2">
            本文
          </label>
          <div className="prose max-w-none">
            <SimpleMdeReact id="content" value={content} onChange={setContent} />
          </div>
          <input type="hidden" name="content" value={content} />
        </div>

        <div className="flex justify-end">
          <button type="submit" className="inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 py-3 px-6 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-transform hover:scale-105">
            {post ? '更新する' : '投稿する'}
          </button>
        </div>
      </form>
    </div>
  );
}