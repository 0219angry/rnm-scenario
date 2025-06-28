'use server'; // このファイルがサーバーサイドでのみ実行されることを示す

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// フォームの入力値を検証するためのスキーマを定義
const formSchema = z.object({
  sessionId: z.string(),
  youtubeLink: z
    .string()
    .url({ message: '有効なURLを入力してください。' }) // URL形式かチェック
    .or(z.literal('')), // 空文字も許可
});

// フォームの状態を定義
export type FormState = {
  message: string;
  success: boolean;
};

export async function updateYoutubeLink(
  _previousState: FormState,
  formData: FormData
): Promise<FormState> {
  // 1. 認証チェック: 操作を実行する権限があるか確認
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { message: '認証が必要です。', success: false };
  }

  // 2. 入力値の検証
  const result = formSchema.safeParse({
    sessionId: formData.get('sessionId'),
    youtubeLink: formData.get('youtubeLink'),
  });

  if (!result.success) {
    // バリデーションエラー
    return {
      message: result.error.flatten().fieldErrors.youtubeLink?.[0] || '入力値が無効です。',
      success: false,
    };
  }

  const { sessionId, youtubeLink } = result.data;

  // 3. データベースを更新
  try {
    await prisma.sessionParticipant.update({
      where: {
        sessionId_userId: {
          sessionId,
          userId: currentUser.id, // 現在のユーザIDを使用
        },
      },
      data: {
        youtubeLink: youtubeLink || null, // 空文字の場合はnullを保存
      },
    });

    // 4. キャッシュをクリアしてUIを更新
    revalidatePath(`/sessions/${sessionId}`);

    return { message: 'リンクを更新しました。', success: true };

  } catch (error) {
    console.error('リンクの更新に失敗しました:', error);
    return { message: '更新に失敗しました。', success: false };
  }
}