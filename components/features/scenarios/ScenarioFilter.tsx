'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

type SearchParams = {
  genre?: string;
  player_num?: string;
  gm?: string;
};

export default function ScenarioFilter({ searchParams }: { searchParams: SearchParams }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(currentSearchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [currentSearchParams]
  );

  const handlePlayerNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    router.push(pathname + '?' + createQueryString('player_num', e.target.value));
  };

  const handleGmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(pathname + '?' + createQueryString('gm', e.target.value));
  };
  
  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(pathname + '?' + createQueryString('genre', e.target.value));
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">絞り込み</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
            ジャンル
          </label>
          <select
            id="genre"
            name="genre"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            onChange={handleGenreChange}
            defaultValue={searchParams.genre || ''}
          >
            <option value="">すべて</option>
            <option value="MADAMIS">マダミス</option>
            <option value="TRPG">TRPG</option>
            <option value="OTHER">その他</option>
          </select>
        </div>
        <div>
          <label htmlFor="player_num" className="block text-sm font-medium text-gray-700">
            プレイヤー数
          </label>
          <input
            type="number"
            id="player_num"
            name="player_num"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            onChange={handlePlayerNumChange}
            defaultValue={searchParams.player_num || ''}
            min="1"
          />
        </div>
        <div>
          <label htmlFor="gm" className="block text-sm font-medium text-gray-700">
            GM
          </label>
          <select
            id="gm"
            name="gm"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            onChange={handleGmChange}
            defaultValue={searchParams.gm || ''}
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