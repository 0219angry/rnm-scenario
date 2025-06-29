'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { type ProfileFormValues } from "@/components/features/users/ProfileEditForm"; // Zodスキーマをインポート（次に作成）
import { Prisma } from "@prisma/client";

// 戻り値の型を定義
interface UpdateProfileResult {
  success: boolean;
  message: string;
  user?: {
    username: string | null;
  }
}

// 引数としてバリデーション済みの値を受け取る
export async function updateProfile(
  values: ProfileFormValues
): Promise<UpdateProfileResult> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { success: false, message: "認証が必要です。" };
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: values.name,
        username: values.username,
        image: values.image,
        bio: values.bio,
      },
    });

    // キャッシュを再検証
    revalidatePath(`/${updatedUser.username}`);
    revalidatePath('/user/settings');

    return { 
      success: true, 
      message: "プロフィールが更新されました！",
      user: { username: updatedUser.username }
    };
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      const { code, meta } = e;
      if (code === "P2002" && Array.isArray(meta?.target) && meta.target.includes("username")) {
        return {
          success: false,
          message: "このユーザー名は既に使用されています。",
        };
      }
    }
    return { success: false, message: "サーバーエラーが発生しました。" };
  }
}
