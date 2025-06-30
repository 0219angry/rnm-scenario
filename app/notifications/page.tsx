import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from 'next/link';

// 相対時間をフォーマットするヘルパー関数 (サーバーサイドでも使えるように別途定義)
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

const formatRelativeTime = (date: Date): string => {
  return formatDistanceToNow(date, { addSuffix: true, locale: ja });
};

// 通知履歴ページ
export default async function NotificationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login'); // ログインしていない場合はリダイレクト
  }

  // ページネーションなしで全件取得（件数が多い場合はページネーションを実装）
  const allNotifications = await prisma.notification.findMany({
    where: { toUserId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 border-b pb-4">通知履歴</h1>
      <div className="space-y-4">
        {allNotifications.length === 0 ? (
          <p className="text-gray-500">通知の履歴はありません。</p>
        ) : (
          allNotifications.map(notification => (
            <Link 
              key={notification.id} 
              href={notification.linkUrl ?? '#'}
              className="block p-4 border rounded-lg hover:bg-gray-50"
            >
              <p className={`${!notification.isRead ? 'font-semibold' : ''} text-gray-800`}>
                {notification.message}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {formatRelativeTime(notification.createdAt)}
              </p>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}