import { Genre } from "@prisma/client";
import Link from "next/link";
// ✅ アイコンをインポートします
import { PuzzlePieceIcon, CubeIcon, TagIcon } from '@heroicons/react/24/solid';

// ✅ 各ジャンルに対応するスタイル、テキスト、アイコンを定義
const genreStyles: Record<Genre, { text: string; className: string; icon: React.ElementType }> = {
  MADAMIS: {
    text: 'マダミス',
    className: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: PuzzlePieceIcon, // パズルのピースアイコン
  },
  TRPG: {
    text: 'TRPG',
    className: 'bg-green-100 text-green-800 border-green-300',
    icon: CubeIcon, // サイコロをイメージした立方体アイコン
  },
  OTHER: {
    text: 'その他',
    className: 'bg-gray-100 text-gray-800 border-gray-300',
    icon: TagIcon, //汎用的なタグアイコン
  },
};

type Props = {
  genre: Genre;
  linkable?: boolean; // リンクにするかどうかのオプション
};

export function GenreTag({ genre, linkable = false }: Props) {
  const style = genreStyles[genre] || genreStyles.OTHER;
  const Icon = style.icon;

  const TagContent = (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${style.className}`}
    >
      <Icon className="h-4 w-4" />
      {style.text}
    </span>
  );

  if (linkable) {
    return (
      <Link href={`/scenarios?genre=${genre}`} className="transition hover:opacity-80">
        {TagContent}
      </Link>
    );
  }

  return TagContent;
}