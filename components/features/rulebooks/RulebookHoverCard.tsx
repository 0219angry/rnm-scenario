import * as HoverCard from '@radix-ui/react-hover-card';
import { Rulebook } from '@prisma/client';
import Link from 'next/link';

// このコンポーネントはクライアントコンポーネントとして動作する必要があります
"use client";

export function RulebookHoverCard({ rulebook }: { rulebook: Rulebook }) {
  return (
    <HoverCard.Root>
      {/* ★ マウスオーバーの対象となる要素 */}
      <HoverCard.Trigger asChild>
        <span className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
          {rulebook.name}
        </span>
      </HoverCard.Trigger>
      
      {/* ★ ポータルを使って表示することで、親要素のスタイルに影響されないようにする */}
      <HoverCard.Portal>
        {/* ★ 表示されるコンテンツ */}
        <HoverCard.Content 
          className="z-50 w-64 rounded-md border bg-white p-4 shadow-lg animate-in fade-in-0 zoom-in-95 dark:bg-gray-800 dark:border-gray-700"
          sideOffset={5} // トリガーからの距離
        >
          <div className="space-y-2">
            <h4 className="text-sm font-bold">{rulebook.name}</h4>
            <p className="text-sm">
              <span className="font-semibold">システム:</span> {rulebook.system}
            </p>
            <p className="text-sm">
              <span className="font-semibold">出版社:</span> {rulebook.publisher ?? '情報なし'}
            </p>
            {rulebook.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t mt-2">
                {rulebook.description}
              </p>
            )}
             {rulebook.url && (
              <Link href={rulebook.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline mt-2 block">
                公式サイトへ →
              </Link>
            )}
          </div>

          <HoverCard.Arrow className="fill-white dark:fill-gray-800"/>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}