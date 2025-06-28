
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditSessionClient from "./EditSessionClient";
import { fetchSessionById } from "@/lib/data";

export default async function EditSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await fetchSessionById(id);

  if (!session) notFound();

  // シナリオのリストを取得
  const scenarios = await prisma.scenario.findMany({
    orderBy: { title: "asc" },
  });

  return (
    <EditSessionClient
      id={session.id}
      session={session}
      scenarios={scenarios}
    />
  );
}