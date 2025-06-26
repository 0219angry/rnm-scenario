import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

type Props = {
  params: {
    username: string;
  };
};

export default async function UserProfilePage(props: Props) {
  const username = props.params.username;

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return <div>ユーザーが見つかりませんでした…😢</div>;
  }

  return (
<main className="max-w-xl mx-auto mt-12 px-4">
  <h1 className="text-2xl font-bold mb-4">
    {user.name ?? user.username}さんのプロフィール
  </h1>

  <div className="flex items-center gap-4">
    <img
      src={user.image ?? `https://avatar.vercel.sh/${user.id}`}
      alt="プロフィール画像"
      className="w-32 h-32 rounded-full object-cover"
    />
    <div>
      <p className="text-gray-700 font-semibold text-lg">@{user.username}</p>
    </div>
  </div>
</main>
  );
}