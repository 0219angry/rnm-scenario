import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import GMFileManager from "./GMFileManager";

export default async function GMPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      participants: { include: { user: true } },
      owner: true,
    },
  });
  if (!session) notFound();
  const currentUser = await getCurrentUser();
  const isGM =
    currentUser?.id === session.ownerId ||
    session.participants.some(
      (p) => p.userId === currentUser?.id && p.role === "GM"
    );
  if (!isGM) notFound();

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">ファイル管理</h1>
      <GMFileManager sessionId={session.id} />
    </div>
  );
}
