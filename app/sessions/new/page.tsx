import { prisma } from "@/lib/prisma";
import NewSessionClient from "./NewSessionClient";

export default async function NewSessionPage() {
  const scenarios = await prisma.scenario.findMany();

  return (
    <div>
      <NewSessionClient scenarios={scenarios} />
    </div>
  );
}
