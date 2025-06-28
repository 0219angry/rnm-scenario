"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Resolver } from "react-hook-form";
import { z } from "zod";
import { Genre } from "@prisma/client";
import ScenarioSelector from "@/components/ui/ScenarioSelector";
import { format } from "date-fns";

// --- 型定義 ---
type Scenario = {
  id: string;
  title: string;
  genre: Genre;
  playerMin: number;
  playerMax: number;
};

export const sessionFormSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください"),
  scenarioId: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().optional()
  ),
  scheduledAt: z.coerce.date({
    errorMap: () => ({ message: "日付を入力してください" }),
  }),
  isFinished: z.boolean().default(false),
  notes: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().max(1000, "メモは1000文字以内で入力してください").optional()
  ),
});

export type SessionFormValues = z.infer<typeof sessionFormSchema>;

type SessionFormProps = {
  scenarios: Scenario[];
  defaultValues?: Partial<SessionFormValues>;
  onSubmit: (values: SessionFormValues) => Promise<void>;
  isEdit?: boolean;
};

export function SessionForm({
  scenarios,
  defaultValues = {},
  onSubmit,
  isEdit = false,
}: SessionFormProps) {
  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema) as Resolver<SessionFormValues>,
    defaultValues: {
      title: "",
      scheduledAt: new Date(),
      isFinished: false,
      scenarioId: "",
      notes: "",
      ...defaultValues,
    },
  });

  const [genreFilter, setGenreFilter] = useState<Genre[]>([]);
  const [playerCountFilter, setPlayerCountFilter] = useState<number | undefined>();

  return (
    <div className="w-full max-w-2xl p-8 space-y-8 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800">
        {isEdit ? "セッションを編集" : "新しいセッションを登録"}
      </h2>

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* 📝 タイトル */}
        <div>
          <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-700">タイトル</label>
          <input
            id="title"
            type="text"
            {...form.register("title")}
            className="w-full px-3 py-2 rounded-md bg-gray-100"
          />
          {form.formState.errors.title && (
            <p className="mt-1 text-xs text-red-500">{form.formState.errors.title.message}</p>
          )}
        </div>
        {/* 🎛 フィルターUI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">ジャンルで絞り込み</label>
            <select
              onChange={(e) =>
                setGenreFilter(e.target.value ? [e.target.value as Genre] : [])
              }
              className="w-full px-3 py-2 rounded-md bg-gray-100"
            >
              <option value="">全ジャンル</option>
              <option value="MADAMIS">マダミス</option>
              <option value="TRPG">TRPG</option>
              <option value="OTHER">その他</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">人数で絞り込み</label>
            <input
              type="number"
              placeholder="例：4"
              value={playerCountFilter ?? ""}
              onChange={(e) =>
                setPlayerCountFilter(e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full px-3 py-2 rounded-md bg-gray-100"
            />
          </div>
        </div>

        {/* 🔍 シナリオ検索＋絞り込み */}
        <div>
          <ScenarioSelector
            value={form.watch("scenarioId")}
            onChange={(id) => form.setValue("scenarioId", id)}
            scenarios={scenarios}
            genres={genreFilter}
            playerCount={playerCountFilter}
          />
          {form.formState.errors.scenarioId && (
            <p className="mt-1 text-xs text-red-500">{form.formState.errors.scenarioId.message}</p>
          )}
        </div>

        {/* 📅 開催日 */}
        <div>
          <label htmlFor="scheduledAt" className="block mb-2 text-sm font-medium text-gray-700">開催日</label>
          <input
            id="scheduledAt"
            type="datetime-local"
            value={format(form.watch("scheduledAt"), "yyyy-MM-dd'T'HH:mm")}
            onChange={(e) => form.setValue("scheduledAt", new Date(e.target.value))}
          />
          {form.formState.errors.scheduledAt && (
            <p className="mt-1 text-xs text-red-500">{form.formState.errors.scheduledAt.message}</p>
          )}
        </div>

        {/* ✅ 完了チェック */}
        <div className="flex items-center">
          <input
            id="isFinished"
            type="checkbox"
            {...form.register("isFinished")}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isFinished" className="ml-2 text-sm font-medium text-gray-700">完了済み</label>
        </div>

        {/* 📝 メモ */}
        <div>
          <label htmlFor="notes" className="block mb-2 text-sm font-medium text-gray-700">メモ（任意）</label>
          <textarea
            id="notes"
            rows={4}
            {...form.register("notes")}
            className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {form.formState.errors.notes && (
            <p className="mt-1 text-xs text-red-500">{form.formState.errors.notes.message}</p>
          )}
        </div>

        {/* 🚀 送信ボタン */}
        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
        >
          {form.formState.isSubmitting
            ? isEdit ? "保存中..." : "登録中..."
            : isEdit ? "保存する" : "登録する"}
        </button>
      </form>
    </div>
  );
}

export default SessionForm;
