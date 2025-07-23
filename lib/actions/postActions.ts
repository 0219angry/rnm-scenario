'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '../auth';

// (新規作成アクションは変更なし)
export async function createPost(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  const title = formData.get('title') as string;
  const summary = formData.get('summary') as string;
  const content = formData.get('content') as string;

  await prisma.post.create({
    data: {
      title,
      summary,
      content,
      authorId: user.id, // 作成者のユーザーIDを設定
    },
  });

  revalidatePath('/posts');
  redirect('/posts');
}

// ★ 記事更新アクションを追加
export async function updatePost(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  const id = formData.get('id') as string;
  const summary = formData.get('summary') as string;
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  await prisma.post.update({
    where: {
      id: id,
    },
    data: {
      title,
      content,
      summary,
    },
  });

  // 編集した記事のページと一覧ページを再検証
  revalidatePath(`/posts`);
  revalidatePath(`/posts/${id}`);
  redirect(`/posts/${id}`);
}