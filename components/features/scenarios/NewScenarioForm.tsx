"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// --- 外部で定義する型やスキーマ ---

/**
 * ジャンルのEnum定義
 * PrismaのEnumと一致させる必要があります。
 */
export enum Genre {
  MADAMIS = "マダミス",
  TRPG = "TRPG",
  OTHER = "その他",
}

/**
 * コンポーネントが受け取るルールブック情報の型
 */
type Rulebook = {
  id: string;
  name: string;
};

/**
 * NewScenarioFormコンポーネントのPropsの型
 */
interface NewScenarioFormProps {
  rulebooks: Rulebook[];
  // ownerIdは通常、認証状態から取得するためpropsで渡す必要はありません。
}

/**
 * フォームのバリデーションスキーマ定義 (Zod)
 */
const formSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  playerMin: z.coerce.number().int("整数で入力してください").positive("1以上の数値を入力してください"),
  playerMax: z.coerce.number().int("整数で入力してください").positive("1以上の数値を入力してください"),
  requiresGM: z.boolean().default(false),
  genre: z.nativeEnum(Genre, {
    errorMap: () => ({ message: "ジャンルを選択してください" }),
  }),
  averageTime: z.coerce.number().int("整数で入力してください").positive("1分以上で入力してください"),
  // preprocessを使い、空文字が送信された場合にundefinedに変換する
  distribution: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().url("有効なURLを入力してください").optional()
  ),
  isPublic: z.boolean().default(true),
  // preprocessを使い、未選択（空文字）の場合にundefinedに変換する
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
  path: ["playerMax"], // エラーを表示するフィールド
});

// ZodスキーマからTypeScriptの型を推論
type ScenarioFormValues = z.infer<typeof formSchema>;


// --- Reactコンポーネント定義 ---

export function NewScenarioForm({ rulebooks = [] }: NewScenarioFormProps) {
  // react-hook-formの初期化
  const form = useForm<ScenarioFormValues>({
    resolver: zodResolver(formSchema),
    // defaultValuesはフォームの初期表示に使われる
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
    },
  });

  // フォーム送信時の処理
  async function onSubmit(values: ScenarioFormValues) {
    // valuesはZodによって型安全性が保証され、preprocessによって整形済み
    console.log("送信されるデータ:", values);
    
    // TODO: ここでAPIへの送信処理を実装します。
    // ownerIdなどもこのタイミングで追加できます。
    // const dataToSend = { ...values, ownerId: "現在のユーザーID" };
    // await fetch('/api/scenarios', { method: 'POST', body: JSON.stringify(dataToSend) });
    
    alert("シナリオが登録されました（仮）");
  }

  return (
    <div className="w-full max-w-2xl p-8 space-y-8 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800">新しいシナリオを登録</h2>
      
      {/* novalidate を指定し、ブラウザのデフォルトバリデーションを無効化 */}
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
        
        {/* シナリオ名 */}
        <div>
          <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-700">シナリオ名</label>
          <input id="title" {...form.register("title")} className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
          {form.formState.errors.title && <p className="mt-1 text-xs text-red-500">{form.formState.errors.title.message}</p>}
        </div>

        {/* プレイヤー人数 */}
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
        
        {/* ジャンルとルールブック */}
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
                  {genreValue}
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
            {form.formState.errors.rulebookId && <p className="mt-1 text-xs text-red-500">{form.formState.errors.rulebookId.message}</p>}
          </div>
        </div>

        {/* 想定時間 */}
        <div>
          <label htmlFor="averageTime" className="block mb-2 text-sm font-medium text-gray-700">想定時間（分）</label>
          <input id="averageTime" type="number" inputMode="numeric" {...form.register("averageTime")} className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
          {form.formState.errors.averageTime && <p className="mt-1 text-xs text-red-500">{form.formState.errors.averageTime.message}</p>}
        </div>

        {/* 配布先URL */}
        <div>
          <label htmlFor="distribution" className="block mb-2 text-sm font-medium text-gray-700">配布先URL（任意）</label>
          <input id="distribution" type="url" placeholder="https://example.com" {...form.register("distribution")} className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
          {form.formState.errors.distribution && <p className="mt-1 text-xs text-red-500">{form.formState.errors.distribution.message}</p>}
        </div>
        
        {/* チェックボックス */}
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
        
        {/* コメント */}
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

        {/* 送信ボタン */}
        <button 
          type="submit"
          disabled={form.formState.isSubmitting} 
          className="w-full py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
        >
          {form.formState.isSubmitting ? '登録中...' : '登録する'}
        </button>
      </form>
    </div>
  );
}