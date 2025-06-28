// app/scenarios/new/NewScenarioClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { ScenarioForm, ScenarioFormValues } from "@/components/features/scenarios/ScenarioForm";

type Rulebook = {
  id: string;
  name: string;
};

type Props = {
  rulebooks: Rulebook[];
};

export default function NewScenarioClient({ rulebooks }: Props) {
  const router = useRouter();

  const handleCreate = async (values: ScenarioFormValues) => {
    try {
      const res = await fetch("/api/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("登録に失敗しました");

      const scenario = await res.json();
      router.push(`/scenarios/${scenario.id}`);
    } catch (err) {
      console.error("作成エラー:", err);
      alert("登録に失敗しました");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <ScenarioForm
        rulebooks={rulebooks}
        onSubmit={handleCreate}
      />
    </div>
  );
}
