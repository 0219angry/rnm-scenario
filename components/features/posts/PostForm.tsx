'use client';

import { useState } from 'react';
import { Post, PostTag } from '@prisma/client';
import SimpleMdeReact from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import CreatableSelect from 'react-select/creatable';

type PostFormProps = {
  post: (Post & { tags: PostTag[] }) | null;
  allTags: PostTag[];
  action: (formData: FormData) => Promise<void>;
};

export default function PostForm({ post, allTags, action }: PostFormProps) {
  const [content, setContent] = useState(post?.content || '');

  const tagOptions = allTags.map((tag) => ({
    value: tag.name,
    label: tag.name,
  }));

  const defaultTags = post?.tags.map((tag) => ({
    value: tag.name,
    label: tag.name,
  }));

  return (
    // 👇 全体の背景色をダークモードに対応
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        {post ? '記事を編集' : '新しい記事を作成'}
      </h2>
      <form action={action}>
        {post && <input type="hidden" name="id" value={post.id} />}

        <div className="mb-6">
          <label htmlFor="title" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            タイトル
          </label>
          <input type="text" id="title" name="title" required defaultValue={post?.title}
            // 👇 ダークモード用のクラスを追加
            className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200"
            placeholder="記事のタイトルを入力..."
          />
        </div>
        <div className="mb-6">
          <label htmlFor="summary" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            サマリー
          </label>
          <textarea id="summary" name="summary" rows={3} defaultValue={post?.summary || ''}
            // 👇 ダークモード用のクラスを追加
            className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200"
            placeholder="記事の簡単な要約（一覧ページなどで表示されます）"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="tags" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            タグ
          </label>
          {/* 👇 react-selectのスタイルをclassNamesプロパティで指定 */}
          <CreatableSelect
            isMulti
            name="tags"
            options={tagOptions}
            defaultValue={defaultTags}
            placeholder="タグを選択または入力してEnter..."
            classNames={{
              control: () => 'mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 p-1.5 shadow-sm text-sm',
              input: () => 'dark:text-white',
              menu: () => 'bg-white dark:bg-gray-700 rounded-lg shadow-lg mt-1',
              option: ({ isFocused }) => `px-4 py-2 ${isFocused ? 'bg-indigo-100 dark:bg-indigo-600' : ''}`,
              multiValue: () => 'bg-gray-200 dark:bg-gray-600 rounded-sm',
              multiValueLabel: () => 'text-gray-800 dark:text-gray-200 text-sm',
              multiValueRemove: () => 'text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-500',
            }}
          />
        </div>

        <div className="mb-8">
          <label htmlFor="content" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            本文
          </label>
          {/* 👇 Markdownエディタのコンテナ */}
          <div className="editor-container">
            <SimpleMdeReact id="content" value={content} onChange={setContent} />
          </div>
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