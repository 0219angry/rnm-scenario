"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// --- ここから追加・修正 ---

// Prismaのモデルに合わせて、GenreのEnumを定義します。
// プロジェクトの実際のEnum定義に合わせてください。
export enum Genre {
  MADAMIS = "マダミス",
  TRPG = "TRPG",
  OTHER = "その他",
}

// コンポーネントが受け取るpropsの型を定義します。
// Rulebookモデルのidとタイトル（または名前）を想定しています。
type Rulebook = {
  id: string;
  name: string;
};

interface NewScenarioFormProps {
  rulebooks: Rulebook[];
  // ownerIdは通常、認証状態から取得するためpropsで渡す必要はありません。
}

const formSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  playerMin: z.coerce.number().int().min(1, "最低プレイヤー人数は1人以上である必要があります"),
  playerMax: z.coerce.number().int().min(1, "最大プレイヤー人数は1人以上である必要があります"),
  requiresGM: z.boolean().default(false),
  // genreフィールドをスキーマに追加
  genre: z.nativeEnum(Genre, {
    errorMap: () => ({ message: "ジャンルを選択してください" }),
  }),
  averageTime: z.coerce.number().int().min(1, "想定時間は1分以上である必要があります"),
  distribution: z.string().url("有効なURLを入力してください").optional().or(z.literal('')),
  isPublic: z.boolean().default(true),
  // rulebookIdフィールドをスキーマに追加（オプショナル）
  rulebookId: z.string().optional(),
  // commentはモデルにありませんが、有用なため残しています。
  // Prismaモデルに `comment String?` を追加することを検討してください。
  comment: z.string().max(1000, "コメントは1000文字以内で入力してください").optional(),
}).refine(data => data.playerMax >= data.playerMin, {
  message: "最大プレイヤー人数は最低プレイヤー人数以上である必要があります",
  path: ["playerMax"],
});

// コンポーネントがpropsを受け取るように変更
export function NewScenarioForm({ rulebooks = [] }: NewScenarioFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      playerMin: 1,
      playerMax: 1,
      requiresGM: false,
      // genreのデフォルト値を追加
      genre: Genre.MADAMIS,
      averageTime: 60,
      distribution: "",
      isPublic: true,
      // rulebookIdのデフォルト値を追加
      rulebookId: "",
      comment: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // TODO: APIへの送信処理
    // ここで `ownerId` をvaluesに追加してAPIに送信します。
    // 例: const dataToSend = { ...values, ownerId: "現在のユーザーID" };
    console.log(values);
    alert("シナリオが登録されました（仮）");
  }

  // --- ここまで追加・修正 ---

  return (
    <div className="w-full max-w-2xl p-8 space-y-8 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800">新しいシナリオを登録</h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-700">シナリオ名</label>
          <input id="title" {...form.register("title")} className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
          {form.formState.errors.title && <p className="text-red-500 text-xs mt-1">{form.formState.errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="playerMin" className="block mb-2 text-sm font-medium text-gray-700">最低プレイヤー人数</label>
            <input id="playerMin" type="number" {...form.register("playerMin")} className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
            {form.formState.errors.playerMin && <p className="text-red-500 text-xs mt-1">{form.formState.errors.playerMin.message}</p>}
          </div>
          <div>
            <label htmlFor="playerMax" className="block mb-2 text-sm font-medium text-gray-700">最大プレイヤー人数</label>
            <input id="playerMax" type="number" {...form.register("playerMax")} className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
            {form.formState.errors.playerMax && <p className="text-red-500 text-xs mt-1">{form.formState.errors.playerMax.message}</p>}
          </div>
        </div>
        
        {/* --- ここから追加・修正 --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="genre" className="block mb-2 text-sm font-medium text-gray-700">ジャンル</label>
            <select
              id="genre"
              {...form.register("genre")}
              className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {Object.values(Genre).map((genreValue) => (
                <option key={genreValue} value={genreValue}>
                  {genreValue} {/* 必要に応じて表示名を変更してください */}
                </option>
              ))}
            </select>
            {form.formState.errors.genre && <p className="text-red-500 text-xs mt-1">{form.formState.errors.genre.message}</p>}
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
            {form.formState.errors.rulebookId && <p className="text-red-500 text-xs mt-1">{form.formState.errors.rulebookId.message}</p>}
          </div>
        </div>
        {/* --- ここまで追加・修正 --- */}

        <div>
          <label htmlFor="averageTime" className="block mb-2 text-sm font-medium text-gray-700">想定時間（分）</label>
          <input id="averageTime" type="number" {...form.register("averageTime")} className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
          {form.formState.errors.averageTime && <p className="text-red-500 text-xs mt-1">{form.formState.errors.averageTime.message}</p>}
        </div>

        <div>
          <label htmlFor="distribution" className="block mb-2 text-sm font-medium text-gray-700">配布先URL（任意）</label>
          <input id="distribution" {...form.register("distribution")} className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
          {form.formState.errors.distribution && <p className="text-red-500 text-xs mt-1">{form.formState.errors.distribution.message}</p>}
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
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.comment.message}</p>
          )}
        </div>

        <button 
          type="submit"
          disabled={form.formState.isSubmitting} 
          className="w-full py-2 font-bold text-white bg-blue-400 rounded-md hover:bg-blue-500 disabled:bg-gray-300 transition-colors"
        >
          登録する
        </button>
      </form>
    </div>
  );
}