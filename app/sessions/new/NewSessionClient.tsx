// app/session/new/NewSessionClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { SessionForm, SessionFormValues } from "@/components/features/sessions/SessionForm";
import { Genre } from "@prisma/client";

type Scenario = {
  id: string;
  title: string;
  genre: Genre;
  playerMin: number;
  playerMax: number;
};

type Props = {
  scenarios: Scenario[];
};

export default function NewSessionClient({ scenarios }: Props) {
  const router = useRouter();

  const handleCreate = async (values: SessionFormValues) => {
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("登録に失敗しました");

      const session = await res.json();
      router.push(`/sessions/${session.id}`);
    } catch (err) {
      console.error("作成エラー:", err);
      alert("登録に失敗しました");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <SessionForm
        scenarios={scenarios}
        onSubmit={handleCreate}
      />
    </div>
  );
}