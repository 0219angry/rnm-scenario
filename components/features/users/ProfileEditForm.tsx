"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateProfile } from "@/lib/actions/userActions"; // ユーザーアクションをインポート
import type { User } from "@prisma/client";

// ✅ Zodスキーマを定義
export const profileFormSchema = z.object({
  name: z.string().min(1, "名前を入力してください"),
  username: z.string().min(1, "ユーザー名を入力してください"),
  image: z.string().url("有効なURLを入力してください").or(z.literal("")).optional(),
  bio: z.string().max(500, "自己紹介は500文字以内で入力してください").optional(),
});

// ✅ Zodスキーマから型を推論
export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileEditForm({ user }: { user: User }) {
  const router = useRouter();
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ProfileFormValues>({
    // ✅ zodResolverを連携
    resolver: zodResolver(profileFormSchema) as Resolver<ProfileFormValues>,
    // ✅ 初期値を設定
    defaultValues: {
      name: user.name ?? "",
      username: user.username ?? "",
      image: user.image ?? "",
      bio: user.bio ?? "",
    },
  });

  // ✅ フォーム送信時の処理
  const onSubmit = async (values: ProfileFormValues) => {
    const result = await updateProfile(values);

    if (result.success) {
      alert(result.message); // またはToast通知など
      if (result.user?.username) {
        router.push(`/${result.user.username}`);
      }
    } else {
      // サーバーからのエラーをフォームにセット
      // 今回は特定のフィールドに紐づかないエラーとして表示
      setError("root.serverError", {
        type: "manual",
        message: result.message,
      });
    }
  };

  const formControlClasses = "w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";
  const labelClasses = "block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 名前 */}
      <div>
        <label htmlFor="name" className={labelClasses}>名前</label>
        <input
          id="name"
          type="text"
          {...register("name")}
          className={formControlClasses}
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      {/* ユーザー名 */}
      <div>
        <label htmlFor="username" className={labelClasses}>ユーザー名</label>
        <input
          id="username"
          type="text"
          {...register("username")}
          className={formControlClasses}
        />
        {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>}
      </div>

      {/* プロフィール画像URL */}
      <div>
        <label htmlFor="image" className={labelClasses}>プロフィール画像URL</label>
        <input
          id="image"
          type="url"
          {...register("image")}
          className={formControlClasses}
        />
        {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image.message}</p>}
      </div>
      {/* bioフィールド */}
      <div>
        <label htmlFor="bio" className={labelClasses}>自己紹介</label>
        <textarea
          id="bio"
          {...register("bio")}
          className={`${formControlClasses} h-24`}
        />
        {errors.bio && <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>}
      </div>

      {/* サーバーからのエラーメッセージ */}
      {errors.root?.serverError && (
        <p className="text-sm text-red-500">{errors.root.serverError.message}</p>
      )}

      {/* 操作ボタン */}
      <div className="flex justify-end gap-4 pt-4">
        <Link href={`/${user.username}`} className="px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
          キャンセル
        </Link>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors">
          {isSubmitting ? "保存中..." : "保存する"}
        </button>
      </div>
    </form>
  );
}