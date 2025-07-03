import Link from 'next/link';
import Image from 'next/image';
import { User } from '@prisma/client';

export function OwnerInfo({ owner }: { owner: User }) {
  return (
    <div className="text-sm text-gray-500 dark:text-gray-400 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
      <span className="font-semibold">作成者:</span>
      <Image
        width={32}
        height={32}
        src={owner.image ?? `https://avatar.vercel.sh/${owner.id}`}
        alt={owner.name || 'Owner Icon'}
        className="w-8 h-8 rounded-full"
      />
      <Link
        href={`/${owner.username ?? owner.id}`}
        className="text-blue-500 dark:text-blue-200 hover:underline"
      >
        {owner.name ?? owner.username}
      </Link>
    </div>
  );
}