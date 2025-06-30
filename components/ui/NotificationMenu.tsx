'use client';

import { useEffect, useState, Fragment } from "react";
// ▼▼▼ ステップ1: import文を修正 ▼▼▼
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from "@headlessui/react";
import { FaBell } from "react-icons/fa";
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from 'next/link';

// (Notification型、formatRelativeTime関数は変更なし)
type Notification = {
  id: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
};

// 相対時間をフォーマットするヘルパー関数
const formatRelativeTime = (dateString: string): string => { // 戻り値の型を明記すると、より安全です
  // ↓↓↓ この "return" が絶対に必要です！ ↓↓↓
  return formatDistanceToNow(new Date(dateString), {
    addSuffix: true,
    locale: ja,
  });
};



export function NotificationMenu() {
  /**
   * 通知リストを保持するためのState。
   */
  const [notifications, setNotifications] = useState<Notification[]>([]);

  /**
   * 通知アイテムがクリックされたときに呼び出される関数。
   * 通知を既読状態に更新する。
   * @param notificationId - 既読にする通知のID
   */
  const handleNotificationClick = async (notificationId: string) => {
    // 1. オプティミスティックUIアップデート:
    // APIの応答を待たずにUIを即時更新し、ユーザーの体感速度を向上させる。
    setNotifications(prevNotifications =>
      prevNotifications.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );

    // 2. バックエンドとの同期:
    // サーバー上のデータを実際に更新する。
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      // エラーが発生した場合、UIを元に戻す処理をここに追加することも可能。
      // 例: fetchNotifications(); を再度呼び出すなど。
    }
  };

  /**
   * コンポーネントのマウント時および定期的に通知を取得するためのEffectフック。
   */
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        } else {
          console.error("Failed to fetch notifications with status:", res.status);
        }
      } catch (error) {
        console.error("An error occurred while fetching notifications:", error);
      }
    };

    // 1. 初回読み込み: コンポーネントが表示された直後に一度データを取得する。
    fetchNotifications();

    // 2. 定期的なポーリング: 15秒ごとに新しい通知がないかサーバーに問い合わせる。
    const interval = setInterval(fetchNotifications, 15000);

    // 3. クリーンアップ: コンポーネントが不要になった際に、
    // ポーリングを停止してメモリリークを防ぐ。
    return () => clearInterval(interval);
  }, []); // 空の依存配列は、このEffectがマウント時に一度だけ実行されることを意味する。

  /**
   * 未読通知が存在するかどうかを判定する計算済み変数。
   * この結果をもとに、未読インジケータの表示・非表示を制御する。
   */
  const hasUnread = notifications.some(n => !n.isRead);

  return (
    // ▼▼▼ ステップ2: JSXのコンポーネント名を修正 ▼▼▼
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <MenuButton className="relative inline-flex justify-center rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2">
          <FaBell className="h-6 w-6" aria-hidden="true" />
          {hasUnread && (
            <span className="absolute -top-0 -right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </MenuButton>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className="absolute right-0 mt-2 w-80 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">通知</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-4">
                <p className="text-sm text-gray-500">新しい通知はありません</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <MenuItem key={notification.id}>
                  {({ active }) => (
                    <Link
                      href={notification.linkUrl ?? '#'}
                      onClick={() => handleNotificationClick(notification.id)}
                      className={`block px-4 py-3 text-sm ${
                        active ? 'bg-gray-100' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                        )}
                        <div className={`flex-1 ${notification.isRead ? 'pl-5' : ''}`}>
                          <p className={`text-gray-800 ${!notification.isRead ? 'font-semibold' : ''}`}>
                            {notification.message}
                          </p>
                          <p className={`mt-1 text-xs ${!notification.isRead ? 'text-blue-600' : 'text-gray-500'}`}>
                            {formatRelativeTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )}
                </MenuItem>
              ))
            )}
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
}