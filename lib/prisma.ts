import { PrismaClient } from '@prisma/client'

// PrismaClientは高価なオブジェクトなので、グローバルに一度だけインスタンス化する
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // 必要に応じてログ設定などを追加
    // log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma