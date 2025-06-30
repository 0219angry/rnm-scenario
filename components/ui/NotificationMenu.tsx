'use client';

import { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";

type Notification = {
  id: string;
  message: string;  // 'content' から 'message' へ変更
  linkUrl?: string; // 'link' から 'linkUrl' へ変更
  isRead: boolean;  // 'read' から 'isRead' へ変更
  createdAt: string;
};

export function NotificationMenu() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    };

    fetchNotifications(); // 初回読み込み

    const interval = setInterval(fetchNotifications, 5000); // 5秒ごとにポーリング

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative">
        <FaBell className="text-xl" />
        {/* ▼▼▼ n.read -> n.isRead に変更 ▼▼▼ */}
        {notifications.some(n => !n.isRead) && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">●</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-md z-50 border">
          <div className="p-2 font-semibold border-b">通知</div>
          <ul className="p-2 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="text-sm text-gray-500 px-2 py-1">通知はありません</li>
            ) : (
              notifications.map(n => (
                <li key={n.id} className={`border-b last:border-none rounded-md ${
                  !n.isRead ? 'bg-blue-50' : '' // 未読の場合は背景色を変更
                }`}>
                  {/* ▼▼▼ n.link -> n.linkUrl に変更 ▼▼▼ */}
                  <a href={n.linkUrl ?? "#"} className="block text-sm p-2 hover:bg-gray-100">
                    {/* ▼▼▼ n.content -> n.message に変更 ▼▼▼ */}
                    <p>{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleString('ja-JP')}
                    </p>
                  </a>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
