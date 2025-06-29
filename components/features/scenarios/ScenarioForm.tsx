"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Resolver} from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Genre } from "@prisma/client"; 
import { useEffect } from "react";

// --- 型定義とスキーマ ---

// ジャンルのEnum (PrismaのEnumとは別に、表示用の値を持つ)
export enum GenreName {
  MADAMIS = "マダミス",
  TRPG = "TRPG",
  OTHER = "その他",
}

// 親コンポーネントから受け取るルールブックの型
type Rulebook = {
  id: string;
  name: string;
};

// 親コンポーネントから受け取るPropsの型
interface NewScenarioFormProps {
  rulebooks: Rulebook[];
  // フォーム送信時の処理を外部から注入できるようにする
  onFormSubmit: (values: ScenarioFormValues) => Promise<void>;
  defaultValues?: Partial<ScenarioFormValues>; // 編集時の初期値
  isEdit?: boolean; // 編集モードかどうか
}

// Zodによるフォームのバリデーションスキーマ
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
  priceMax: z.coerce.number().int().nonnegative("価格上限は0円以上で入力してください").optional(),
  priceMin: z.coerce.number().int().nonnegative("価格下限は0円以上で入力してください").optional(),
  // priceMinとpriceMaxの関係を定義
  isPublic: z.boolean().default(true),
  rulebookId: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().optional()
  ),
  content: z.preprocess( // Prismaモデルの`content`に合わせて名前を変更
    (val) => (val === "" ? undefined : val),
    z.string().max(5000, "内容は5000文字以内で入力してください").optional()
  ),
}).refine(data => data.playerMax >= data.playerMin, {
  message: "最大プレイヤー人数は最低プレイヤー人数以上である必要があります",
  path: ["playerMax"],
}).refine(data => {
  // priceMaxとpriceMinの関係を定義
  if (data.priceMax !== undefined && data.priceMin !== undefined) {
    return data.priceMax >= data.priceMin;
  }
  return true; // どちらかが未指定ならOK
});

// Zodスキーマからフォームの型を推論
export type ScenarioFormValues = z.infer<typeof formSchema>;


// --- Reactコンポーネント定義 ---

export function ScenarioForm({ 
  rulebooks = [],
  onFormSubmit,
  defaultValues = {}, // 親コンポーネントからの初期値
  isEdit = false, // デフォルトは新規登録モード
}: NewScenarioFormProps) {
  const form = useForm<ScenarioFormValues>({
    resolver: zodResolver(formSchema) as Resolver<ScenarioFormValues>,
    // フォームの初期値
    defaultValues: {
      title: "",
      playerMin: 1,
      playerMax: 4,
      requiresGM: false,
      genre: Genre.MADAMIS,
      averageTime: 120,
      distribution: "",
      priceMax: 0, // 初期値は未指定
      priceMin: 0,
      isPublic: true,
      rulebookId: "",
      content: "",
      ...defaultValues, // 親コンポーネントからの初期値をマージ
    },
  });

  // watchで現在のフォームの値を取得し、UIに反映させる
  const watchGenre = form.watch("genre");
  const watchRequiresGM = form.watch("requiresGM");
  const distributionUrl = form.watch("distribution");

  useEffect(() => {
    const fetchBoothPrice = async () => {
      if (!distributionUrl || !distributionUrl.startsWith("https://booth.pm/")) return;
      try {
        const res = await fetch(`/api/booth-price?url=${encodeURIComponent(distributionUrl)}`);
        const data = await res.json();
        if (typeof data.min === "number") {
          form.setValue("priceMin", data.min, { shouldValidate: true });
        }
        if (typeof data.max === "number") {
          form.setValue("priceMax", data.max, { shouldValidate: true });
        }
      } catch (err) {
        console.warn("価格の取得に失敗しちゃったよ…", err);
      }
    };

    fetchBoothPrice();
  }, [distributionUrl, form.setValue]);

  return (
    <div className="w-full max-w-2xl p-8 space-y-8 bg-white rounded-xl shadow-md dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
        {isEdit ? "シナリオを編集" : "新しいシナリオを登録"}
      </h2>
      
      <form onSubmit={form.handleSubmit(onFormSubmit)} noValidate className="space-y-6">
        {/* シナリオ名 */}
        <div>
          <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">シナリオ名 <span className="text-red-500">*</span></label>
          <input id="title" {...form.register("title")} className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
          {form.formState.errors.title && <p className="mt-1 text-xs text-red-500">{form.formState.errors.title.message}</p>}
        </div>

        {/* プレイヤー人数 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="playerMin" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">最低プレイヤー人数 <span className="text-red-500">*</span></label>
            <input id="playerMin" type="number" inputMode="numeric" {...form.register("playerMin")} className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
            {form.formState.errors.playerMin && <p className="mt-1 text-xs text-red-500">{form.formState.errors.playerMin.message}</p>}
          </div>
          <div>
            <label htmlFor="playerMax" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">最大プレイヤー人数 <span className="text-red-500">*</span></label>
            <input id="playerMax" type="number" inputMode="numeric" {...form.register("playerMax")} className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
            {form.formState.errors.playerMax && <p className="mt-1 text-xs text-red-500">{form.formState.errors.playerMax.message}</p>}
          </div>
        </div>

        {/* ジャンルとGM要否のタグ選択UI */}
        <div className="space-y-4 rounded-lg border bg-slate-50 p-4 dark:bg-gray-700 dark:border-gray-600">
          <div>
            <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">ジャンル <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              {Object.values(Genre).map((genreValue) => (
                <button
                  key={genreValue}
                  type="button"
                  onClick={() => form.setValue("genre", genreValue, { shouldValidate: true })}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    watchGenre === genreValue
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
                  }`}
                >
                  {watchGenre === genreValue && <CheckCircleIcon className="h-5 w-5" />}
                  {genreValue}
                </button>
              ))}
            </div>
            {form.formState.errors.genre && <p className="mt-2 text-xs text-red-500">{form.formState.errors.genre.message}</p>}
          </div>
          <div>
            <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">GM要否 <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => form.setValue("requiresGM", true)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  watchRequiresGM === true
                    ? 'bg-orange-500 text-white shadow'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
                }`}
              >
                {watchRequiresGM === true && <CheckCircleIcon className="h-5 w-5" />}
                GM必須
              </button>
              <button
                type="button"
                onClick={() => form.setValue("requiresGM", false)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  watchRequiresGM === false
                    ? 'bg-green-500 text-white shadow'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
                }`}
              >
                {watchRequiresGM === false && <CheckCircleIcon className="h-5 w-5" />}
                GM不要
              </button>
            </div>
          </div>
        </div>

        {/* 使用ルールブック */}
        <div>
          <label htmlFor="rulebookId" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">使用ルールブック（任意）</label>
          <select
            id="rulebookId"
            {...form.register("rulebookId")}
            className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          >
            <option value="">選択しない</option>
            {rulebooks.map((rulebook) => (
              <option key={rulebook.id} value={rulebook.id}>{rulebook.name}</option>
            ))}
          </select>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            目的のルールブックがない場合は、
            <Link href="/rulebooks/new" target="_blank" className="text-blue-600 hover:underline dark:text-blue-400">
              こちらから新規登録
            </Link>
            してください。
          </p>
        </div>

        {/* 想定時間 */}
        <div>
          <label htmlFor="averageTime" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">想定時間（分） <span className="text-red-500">*</span></label>
          <input id="averageTime" type="number" inputMode="numeric" {...form.register("averageTime")} className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
          {form.formState.errors.averageTime && <p className="mt-1 text-xs text-red-500">{form.formState.errors.averageTime.message}</p>}
        </div>

        {/* 配布先URL */}
        <div>
          <label htmlFor="distribution" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">配布先URL（任意）</label>
          <input id="distribution" type="url" placeholder="https://example.com" {...form.register("distribution")} className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
          {form.formState.errors.distribution && <p className="mt-1 text-xs text-red-500">{form.formState.errors.distribution.message}</p>}
        </div>

        {/* 価格 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="priceMin" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">最低価格 <span className="text-red-500">*</span></label>
            <input id="priceMin" type="number" inputMode="numeric" {...form.register("priceMin")} className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
            {form.formState.errors.priceMin && <p className="mt-1 text-xs text-red-500">{form.formState.errors.priceMin.message}</p>}
          </div>
          <div>
            <label htmlFor="priceMax" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">最高価格 <span className="text-red-500">*</span></label>
            <input id="priceerMax" type="number" inputMode="numeric" {...form.register("priceMax")} className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
            {form.formState.errors.priceMax && <p className="mt-1 text-xs text-red-500">{form.formState.errors.priceMax.message}</p>}
          </div>
        </div>

        {/* 公開設定 */}
        <div className="flex items-center">
          <input id="isPublic" type="checkbox" {...form.register("isPublic")} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600" />
          <label htmlFor="isPublic" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">このシナリオを公開する</label>
        </div>
        
        {/* 内容・あらすじ */}
        <div>
          <label htmlFor="content" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">内容・あらすじ（任意）</label>
          <textarea
            id="content"
            rows={6}
            {...form.register("content")}
            className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          />
          {form.formState.errors.content && <p className="mt-1 text-xs text-red-500">{form.formState.errors.content.message}</p>}
        </div>

        {/* 送信ボタン */}
        <button 
          type="submit"
          disabled={form.formState.isSubmitting} 
          className="w-full py-3 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {form.formState.isSubmitting 
            ? (isEdit ? '更新中...' : '登録中...') 
            : (isEdit ? '更新する' : '保存する')}
        </button>
      </form>
    </div>
  );
}