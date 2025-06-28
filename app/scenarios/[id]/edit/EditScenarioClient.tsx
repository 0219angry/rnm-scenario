// app/scenarios/[id]/edit/EditScenarioClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { ScenarioForm, ScenarioFormValues } from "@/components/features/scenarios/ScenarioForm";
import { Genre } from "@prisma/client";

type Rulebook = { id: string; name: string };
type Props = {
  id: string;
  scenario: {
    title: string;
    playerMin: number;
    playerMax: number;
    genre: Genre;
    requiresGM: boolean;
    averageTime: number;
    distribution: string | null;
    rulebookId: string | null;
    content: string | null;
    isPublic: boolean;
  };
  rulebooks: Rulebook[];
};

export default function EditScenarioClient({ id, scenario, rulebooks }: Props) {
  const router = useRouter();

  const handleUpdate = async (values: ScenarioFormValues) => {
    try {
      const res = await fetch(`/api/scenarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("更新に失敗しました");
      router.push(`/scenarios/${id}`);
    } catch (err) {
      console.error("更新エラー:", err);
      alert("保存に失敗しました…🥺");
    }
  };

  return (
    <ScenarioForm
      isEdit
      rulebooks={rulebooks}
      defaultValues={{
        title: scenario.title,
        playerMin: scenario.playerMin,
        playerMax: scenario.playerMax,
        genre: (scenario.genre ?? Genre.OTHER) as Genre | undefined,
        requiresGM: scenario.requiresGM,
        averageTime: scenario.averageTime,
        distribution: scenario.distribution ?? "",
        rulebookId: scenario.rulebookId ?? "",
        comment: scenario.content ?? "",
        isPublic: scenario.isPublic,
      }}
      onSubmit={handleUpdate}
    />
  );
}
