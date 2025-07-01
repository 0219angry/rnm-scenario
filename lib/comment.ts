'use server';

import { z } from 'zod';
import { prisma } from './prisma';
import { getCurrentUser } from './auth';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

// 成功時に返されるコメントデータの型
type CommentWithUser = Prisma.CommentGetPayload<{
  include: { user: true };
}>;

// アクションの状態を表す型
type CreateCommentState = {
  errors?: {
    text?: string[];
  };
  error?: string;
  success?: boolean;
  data?: CommentWithUser;
} | undefined;

const FormSchema = z.object({
  text: z.string().min(1, { message: 'コメントは1文字以上で入力してください。' }),
  sessionId: z.string(),
});

export async function createComment(prevState: CreateCommentState, formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'ログインが必要です。' };
    }

    const validatedFields = FormSchema.safeParse({
      text: formData.get('text'),
      sessionId: formData.get('sessionId'),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }
    
    const { text, sessionId } = validatedFields.data;

    const newComment = await prisma.comment.create({
      data: {
        text,
        sessionId,
        userId: user.id,
      },
      include: {
        user: true, // ★ ユーザー情報を含めて取得
      }
    });

    revalidatePath(`/sessions/${sessionId}`);
    
    // ★ 成功時に、データを含んだオブジェクトを返す
    return { success: true, data: newComment };

  } catch (e) {
    return { error: `コメントの投稿に失敗しました。${e}` };
  }
}