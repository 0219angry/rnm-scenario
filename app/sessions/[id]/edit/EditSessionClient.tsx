"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  SessionForm,
  SessionFormValues,
} from "@/components/features/sessions/SessionForm";
import { Genre } from "@prisma/client";
import { TrashIcon } from "@heroicons/react/24/outline";

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

  const [isDeleting, setIsDeleting] = useState(false);

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

  // ✅【新規追加】セッション削除処理
  const handleDelete = async () => {
    // ユーザーに最終確認
    if (!window.confirm("このセッションを本当に削除しますか？\nこの操作は元に戻せません。")) {
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/sessions/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error("削除に失敗しました");
      }

      // 削除成功後、セッション一覧ページなどに移動
      router.push('/sessions');
      router.refresh(); // 画面を更新

    } catch (err) {
      console.error("削除エラー:", err);
      alert("削除に失敗しました…🥺");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
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
      {/* ✅【新規追加】削除ボタンエリア */}
      <div className="border-t border-dashed border-red-400 pt-8 mt-8">
        <h3 className="text-lg font-bold text-red-700">セッションの削除</h3>
        <p className="text-sm text-gray-600 mt-2">
          このセッションを完全に削除します。参加者情報などもすべて失われ、この操作は元に戻すことができません。
        </p>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700 disabled:bg-gray-400"
        >
          <TrashIcon className="h-5 w-5" />
          {isDeleting ? "削除中..." : "セッションを削除する"}
        </button>
      </div>
    </div>
  );
}