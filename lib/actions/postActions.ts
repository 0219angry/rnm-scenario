'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '../auth';

// ランダムなHEXカラーを生成するヘルパー関数
const getRandomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

// タグ名を受け取り、DBに存在しない場合は新規作成するヘルパー関数
async function getOrCreateTags(tagNames: string[]) {
  const tags = [];
  for (const name of tagNames) {
    // モデル名を `PostTag` に修正
    const tag = await prisma.postTag.upsert({
      where: { name },
      update: {},
      create: {
        name,
        color: getRandomColor(),
      },
    });
    tags.push({ id: tag.id });
  }
  return tags;
}

// ===== 新規作成アクション =====
export async function createPost(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const title = formData.get('title') as string;
  const summary = formData.get('summary') as string;
  const content = formData.get('content') as string;
  const tagNames = formData.getAll('tags') as string[];

  const tagsToConnect = await getOrCreateTags(tagNames);

  await prisma.post.create({
    data: {
      title,
      summary,
      content,
      authorId: user.id,
      // 👇 暗黙リレーションのシンプルな構文
      tags: {
        connect: tagsToConnect,
      },
    },
  });

  revalidatePath('/posts');
  redirect('/posts');
}

// ===== 記事更新アクション =====
export async function updatePost(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const summary = formData.get('summary') as string;
  const content = formData.get('content') as string;
  const tagNames = formData.getAll('tags') as string[];

  const tagsToConnect = await getOrCreateTags(tagNames);

  await prisma.post.update({
    where: { id: id },
    data: {
      title,
      content,
      summary,
      // 👇 setを使って、タグの関連付けを一度に更新
      tags: {
        set: tagsToConnect,
      },
    },
  });

  revalidatePath(`/posts`);
  revalidatePath(`/posts/${id}`);
  redirect(`/posts/${id}`);
}