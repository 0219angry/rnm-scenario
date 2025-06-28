"use client";

import { useRouter } from "next/navigation";
import {
  SessionForm,
  SessionFormValues,
} from "@/components/features/sessions/SessionForm";
import { Genre } from "@prisma/client";

// --- 型定義 ---
type Scenario = {
  id: string;
  title: string;
  genre: Genre;
  playerMin: number;
  playerMax: number;
};

// ✨【修正点1】Propsの型定義を、DBから取得した実際のデータの型に合わせる
type Props = {
  id: string;
  session: {
    title: string | null; // 👈 titleはnullの可能性があることを明記
    scheduledAt: Date;
    isFinished: boolean;
    scenarioId: string;
    notes: string | null;   // 👈 notesもnullの可能性があることを明記
  };
  scenarios: Scenario[];
};

export default function EditSessionClient({ id, session, scenarios }: Props) {
  const router = useRouter();

  const handleUpdate = async (values: SessionFormValues) => {
    try {
      const res = await fetch(`/api/sessions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("更新に失敗しました");
      router.push(`/sessions/${id}`);
      router.refresh(); // 👈【改善案】更新後にデータを再取得して画面に反映させる
    } catch (err) {
      console.error("更新エラー:", err);
      alert("保存に失敗しました…🥺");
    }
  };

  return (
    <SessionForm
      isEdit
      scenarios={scenarios}
      defaultValues={{
        title: session.title ?? "", // ✅ これで型定義と実装が一致
        // ✨【修正点2】 new Date() は不要。Dateオブジェクトをそのまま渡す
        scheduledAt: session.scheduledAt,
        isFinished: session.isFinished,
        scenarioId: session.scenarioId, // scenarioIdは必須項目なので ?? "" は不要
        notes: session.notes ?? "",       // ✅ これで型定義と実装が一致
      }}
      onSubmit={handleUpdate}
    />
  );
}