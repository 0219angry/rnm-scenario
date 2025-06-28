'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';

// 状態オブジェクトの型を定義
export type CommentFormState = {
  success?: string;
  error?: string;
  errors?: {
    sessionId?: string[];
    text?: string[];
  };
};

const CommentSchema = z.object({
  text: z.string().min(1, { message: 'コメントは1文字以上で入力してください。' }),
  sessionId: z.string(),
});

// ▼▼▼ 関数のシグネチャ（引数）を修正 ▼▼▼
export async function createComment(
  _prevState: CommentFormState | undefined, // 👈 [変更] 第1引数にprevStateを追加
  formData: FormData
): Promise<CommentFormState> { // 👈 [変更] 戻り値の型を明記

  const user = await getCurrentUser();
  if (!user?.id) {
    return { error: 'ログインが必要です。' };
  }
  const userId = user.id;

  const validatedFields = CommentSchema.safeParse({
    text: formData.get('text'),
    sessionId: formData.get('sessionId'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { text, sessionId } = validatedFields.data;

  try {
    await prisma.comment.create({
      data: {
        text,
        sessionId,
        userId,
      },
    });
  } catch (error) {
    console.error('コメントの投稿に失敗:', error);
    return { error: 'データベースエラー: コメントの投稿に失敗しました。' };
  }

  revalidatePath(`/sessions/${sessionId}`);
  return { success: 'コメントを投稿しました。' };
}