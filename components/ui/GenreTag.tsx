// components/ui/GenreTag.tsx
import Link from "next/link";
import { Genre } from "@prisma/client";

const genreMap: Record<Genre, string> = {
  MADAMIS: "マダミス",
  TRPG: "TRPG",
  OTHER: "その他",
};

const genreColorMap: Record<Genre, string> = {
  MADAMIS: "bg-purple-600",
  TRPG: "bg-green-600",
  OTHER: "bg-gray-500",
};

type GenreTagProps = {
  genre: Genre;
  linkable?: boolean; // 🔸 オプションでリンク可にできるよ
};

export function GenreTag({ genre, linkable = true }: GenreTagProps) {
  const tag = (
    <span
      className={`inline-block px-2 py-1 text-sm font-medium text-white rounded-full ${genreColorMap[genre]}`}
    >
      {genreMap[genre]}
    </span>
  );

  return linkable ? (
    <Link href={`/scenarios?genre=${genre}`} prefetch={false}>
      {tag}
    </Link>
  ) : (
    tag
  );
}
