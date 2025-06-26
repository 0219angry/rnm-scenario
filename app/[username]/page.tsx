import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

type Props = {
  params: {
    username: string;
  };
};

export default async function UserProfilePage({ params }: Props) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
  });

  if (!user) {
    notFound();
  }

  return (
    <div>
      <h1>{user.name}</h1>
      <p>@{user.username}</p>
      {/* ここに詳細情報を追加していきますわ */}
    </div>
  );
}
