// app/scenarios/[id]/edit/page.tsx
import { fetchScenarioById } from "@/lib/data";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditScenarioClient from "./EditScenarioClient";

export default async function EditScenarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scenario = await fetchScenarioById(id);
  const rulebooks = await prisma.rulebook.findMany({ orderBy: { name: "asc" } });

  if (!scenario) notFound();

  return (
    <EditScenarioClient
      id={scenario.id}
      scenario={scenario}
      rulebooks={rulebooks}
    />
  );
}
