'use client';

import { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";

type Notification = {
  id: string;
  content: string;
  link?: string;
  read: boolean;
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
        {notifications.some(n => !n.read) && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">!</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-md z-50">
          <ul className="p-2">
            {notifications.length === 0 ? (
              <li className="text-sm text-gray-500 px-2 py-1">通知はありません</li>
            ) : (
              notifications.map(n => (
                <li key={n.id} className="border-b last:border-none px-2 py-2">
                  <a href={n.link ?? "#"} className="text-sm text-black hover:underline">
                    {n.content}
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
