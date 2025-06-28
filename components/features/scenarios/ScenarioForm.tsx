"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Resolver } from "react-hook-form";
import { z } from "zod";
import { Genre } from "@prisma/client";
import Link from "next/link";

// --- 型定義とスキーマ ---

export enum GenreName {
  MADAMIS = "マダミス",
  TRPG = "TRPG",
  OTHER = "その他",
}


type Rulebook = {
  id: string;
  name: string;
};

export const formSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  playerMin: z.coerce.number().int().positive("1人以上で入力してください"),
  playerMax: z.coerce.number().int().positive("1人以上で入力してください"),
  requiresGM: z.boolean().default(false),
  genre: z.nativeEnum(Genre, {
    errorMap: () => ({ message: "ジャンルを選択してください" }),
  }),
  averageTime: z.coerce.number().int().positive("1分以上で入力してください"),
  distribution: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().url("有効なURLを入力してください").optional()
  ),
  isPublic: z.boolean().default(true),
  rulebookId: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().optional()
  ),
  comment: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().max(1000, "コメントは1000文字以内で入力してください").optional()
  ),
}).refine(data => data.playerMax >= data.playerMin, {
  message: "最大プレイヤー人数は最低プレイヤー人数以上である必要があります",
  path: ["playerMax"],
});

export type ScenarioFormValues = z.infer<typeof formSchema>;

type ScenarioFormProps = {
  rulebooks: Rulebook[];
  defaultValues?: Partial<ScenarioFormValues>;
  onSubmit: (values: ScenarioFormValues) => Promise<void>;
  isEdit?: boolean;
};

export function ScenarioForm({
  rulebooks,
  defaultValues = {},
  onSubmit,
  isEdit = false,
}: ScenarioFormProps) {
  const form = useForm<ScenarioFormValues>({
    resolver: zodResolver(formSchema) as Resolver<ScenarioFormValues>,
    defaultValues: {
      title: "",
      playerMin: 1,
      playerMax: 4,
      requiresGM: false,
      genre: Genre.MADAMIS,
      averageTime: 120,
      distribution: "",
      isPublic: true,
      rulebookId: "",
      comment: "",
      ...defaultValues,
    },
  });

  return (
    <div className="w-full max-w-2xl p-8 space-y-8 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800">
        {isEdit ? "シナリオを編集" : "新しいシナリオを登録"}
      </h2>

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
        <div>
          <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-700">シナリオ名</label>
          <input id="title" {...form.register("title")} className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
          {form.formState.errors.title && <p className="mt-1 text-xs text-red-500">{form.formState.errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="playerMin" className="block mb-2 text-sm font-medium text-gray-700">最低プレイヤー人数</label>
            <input id="playerMin" type="number" inputMode="numeric" {...form.register("playerMin")} className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
            {form.formState.errors.playerMin && <p className="mt-1 text-xs text-red-500">{form.formState.errors.playerMin.message}</p>}
          </div>
          <div>
            <label htmlFor="playerMax" className="block mb-2 text-sm font-medium text-gray-700">最大プレイヤー人数</label>
            <input id="playerMax" type="number" inputMode="numeric" {...form.register("playerMax")} className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
            {form.formState.errors.playerMax && <p className="mt-1 text-xs text-red-500">{form.formState.errors.playerMax.message}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="genre" className="block mb-2 text-sm font-medium text-gray-700">ジャンル</label>
            <select
              id="genre"
              {...form.register("genre")}
              className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {Object.values(Genre).map((genreValue) => (
                <option key={genreValue} value={genreValue}>
                  {GenreName[genreValue]}
                </option>
              ))}
            </select>
            {form.formState.errors.genre && <p className="mt-1 text-xs text-red-500">{form.formState.errors.genre.message}</p>}
          </div>
          <div>
            <label htmlFor="rulebookId" className="block mb-2 text-sm font-medium text-gray-700">使用ルールブック（任意）</label>
            <select
              id="rulebookId"
              {...form.register("rulebookId")}
              className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">選択しない</option>
              {rulebooks.map((rulebook) => (
                <option key={rulebook.id} value={rulebook.id}>
                  {rulebook.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500">
              目的のルールブックがない場合は、
              <Link href="/rulebooks/new" target="_blank" className="text-blue-600 hover:underline">
                こちらから新規登録
              </Link>
              してください。
              <span className="text-red-500"> (新しいタブで開きます)</span>
            </p>
            {form.formState.errors.rulebookId && <p className="mt-1 text-xs text-red-500">{form.formState.errors.rulebookId.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="averageTime" className="block mb-2 text-sm font-medium text-gray-700">想定時間（分）</label>
          <input id="averageTime" type="number" inputMode="numeric" {...form.register("averageTime")} className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
          {form.formState.errors.averageTime && <p className="mt-1 text-xs text-red-500">{form.formState.errors.averageTime.message}</p>}
        </div>

        <div>
          <label htmlFor="distribution" className="block mb-2 text-sm font-medium text-gray-700">配布先URL（任意）</label>
          <input id="distribution" type="url" placeholder="https://example.com" {...form.register("distribution")} className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
          {form.formState.errors.distribution && <p className="mt-1 text-xs text-red-500">{form.formState.errors.distribution.message}</p>}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input id="requiresGM" type="checkbox" {...form.register("requiresGM")} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
            <label htmlFor="requiresGM" className="ml-2 text-sm font-medium text-gray-700">GM必須</label>
          </div>
          <div className="flex items-center">
            <input id="isPublic" type="checkbox" {...form.register("isPublic")} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
            <label htmlFor="isPublic" className="ml-2 text-sm font-medium text-gray-700">公開</label>
          </div>
        </div>
        
        <div>
          <label htmlFor="comment" className="block mb-2 text-sm font-medium text-gray-700">コメント（任意）</label>
          <textarea
            id="comment"
            rows={4}
            {...form.register("comment")}
            className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {form.formState.errors.comment && (
            <p className="mt-1 text-xs text-red-500">{form.formState.errors.comment.message}</p>
          )}
        </div>

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
export default ScenarioForm;