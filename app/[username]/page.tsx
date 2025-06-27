import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const users = await prisma.user.findMany({
    where: { username: { not: null } },
    select: { username: true },
  });

  return users.map((user) => ({
    params: {
      username: user.username!,
    },
  }));
}


export default async function UserProfilePage({
    params,
  }: {
    params: Promise<{ username: string }>;
  }) {

  const { username } = await params;
    // paramsがオプショナル(?)なので、存在しないケースを考慮
  if (!username) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    notFound();
  }

  return (
    <main className="max-w-xl mx-auto mt-12 px-4">
      <h1 className="text-2xl font-bold mb-4">
        {user.name ?? user.username}さんのプロフィール
      </h1>

      <div className="flex items-center gap-4">
        <Image
          src={user.image ?? `https://avatar.vercel.sh/${user.id}`}
          alt="プロフィール画像"
          width={128}
          height={128}
          className="w-32 h-32 rounded-full object-cover"
        />
        <div>
          <p className="text-gray-700 font-semibold text-lg">
            @{user.username}
          </p>
        </div>
      </div>
    </main>
  );
}