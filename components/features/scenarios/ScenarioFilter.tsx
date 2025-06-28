'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

// propsは不要なので、コンポーネントの引数を空にする
export default function ScenarioFilter() {
  const router = useRouter();
  const pathname = usePathname();
  // propsの代わりにこのフックから直接パラメータを取得する
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      // 現在のURLパラメータをベースに新しいパラメータを作成
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  // 各入力の変更をハンドルし、URLを更新する
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    router.push(pathname + '?' + createQueryString(name, value));
  };

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">絞り込み</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="genre" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            ジャンル
          </label>
          <select
            id="genre"
            name="genre"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            onChange={handleChange}
            // 変更点：useSearchParamsから直接値を取得して設定
            defaultValue={searchParams.get('genre') || ''}
          >
            <option value="">すべて</option>
            <option value="MADAMIS">マダミス</option>
            <option value="TRPG">TRPG</option>
            <option value="OTHER">その他</option>
          </select>
        </div>
        <div>
          <label htmlFor="player_num" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            プレイヤー数
          </label>
          <input
            type="number"
            id="player_num"
            name="player_num"
            className="mt-1 block w-full pl-3 pr-2 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            onChange={handleChange}
            // 変更点：useSearchParamsから直接値を取得して設定
            defaultValue={searchParams.get('player_num') || ''}
            min="1"
            placeholder="指定なし"
          />
        </div>
        <div>
          <label htmlFor="gm" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            GM
          </label>
          <select
            id="gm"
            name="gm"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            onChange={handleChange}
            // 変更点：useSearchParamsから直接値を取得して設定
            defaultValue={searchParams.get('gm') || ''}
          >
            <option value="">どちらでも</option>
            <option value="required">必須</option>
            <option value="optional">不要</option>
          </select>
        </div>
      </div>
    </div>
  );
}