"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// ✅ Prismaモデルに合わせてZodのスキーマを定義
const rulebookFormSchema = z.object({
  name: z.string().min(1, "ルールブック名は必須です"),
  system: z.string().min(1, "システム名は必須です"),
  publisher: z.string().optional(),
  // URLは任意だが、入力する場合は有効な形式である必要がある
  url: z.string().url("有効なURL形式で入力してください").optional().or(z.literal('')),
  description: z.string().max(1000, "1000文字以内で入力してください").optional(),
});

export type RulebookFormValues = z.infer<typeof rulebookFormSchema>;

type Props = {
  onSubmit: SubmitHandler<RulebookFormValues>;
  isSubmitting: boolean;
  defaultValues?: Partial<RulebookFormValues>; // 編集用に初期値を渡せるようにする
};

export function RulebookForm({ onSubmit, isSubmitting, defaultValues = {} }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<RulebookFormValues>({
    resolver: zodResolver(rulebookFormSchema),
    defaultValues: {
        name: '',
        system: '',
        publisher: '',
        url: '',
        description: '',
        ...defaultValues,
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 必須項目 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            ルールブック名 <span className="text-red-500">*</span>
          </label>
          <input 
            id="name" 
            type="text" 
            {...register("name")} 
            className="mt-1 block w-full rounded-md border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="system" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            システム名 <span className="text-red-500">*</span>
          </label>
          <input 
            id="system" 
            type="text" 
            {...register("system")} 
            className="mt-1 block w-full rounded-md border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
          />
          {errors.system && <p className="mt-1 text-xs text-red-500">{errors.system.message}</p>}
        </div>
      </div>

      {/* ✅【追加】任意項目 */}
      <div>
        <label htmlFor="publisher" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          出版社（任意）
        </label>
        <input 
          id="publisher" 
          type="text" 
          {...register("publisher")} 
          className="mt-1 block w-full rounded-md border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
        />
        {errors.publisher && <p className="mt-1 text-xs text-red-500">{errors.publisher.message}</p>}
      </div>

      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          公式サイトURL（任意）
        </label>
        <input 
          id="url" 
          type="url" 
          {...register("url")}
          placeholder="https://example.com"
          className="mt-1 block w-full rounded-md border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
        />
        {errors.url && <p className="mt-1 text-xs text-red-500">{errors.url.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          説明（任意）
        </label>
        <textarea 
          id="description" 
          {...register("description")}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="ルールブックの概要や特徴などを入力します"
        />
        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
      </div>
      
      <button type="submit" disabled={isSubmitting} className="w-full rounded-md bg-blue-600 px-4 py-2 font-bold text-white transition hover:bg-blue-700 disabled:bg-gray-400">
        {isSubmitting ? "処理中..." : "登録する"}
      </button>
    </form>
  );
}