// app/scenarios/new/page.tsx
import { prisma } from "@/lib/prisma";
import NewScenarioClient from "./NewScenarioClient";

export default async function NewScenarioPage() {
  const rulebooks = await prisma.rulebook.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <NewScenarioClient rulebooks={rulebooks} />;
}
