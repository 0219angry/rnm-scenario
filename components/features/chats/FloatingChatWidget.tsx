'use client';

import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase'; // Supabaseクライアントをインポート
import { ChatWindow, MessageWithAuthor } from './ChatWidget';

// --- アイコンコンポーネント (変更なし) ---
const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.722.06c-.247.007-.48.057-.688.144a4.986 4.986 0 0 1-3.828 3.102.499.499 0 0 1-.585-.379c-.158-.582-.279-1.185-.364-1.793a.5.5 0 0 0-.585-.433 4.981 4.981 0 0 1-3.262-3.263.5.5 0 0 0-.433-.585c-.608-.085-1.211-.206-1.793-.364a.5.5 0 0 1-.379-.585 4.986 4.986 0 0 1 3.102-3.828c.087-.028.171-.044.258-.057l3.68-.059c1.135-.018 2.1.847 2.193 1.98.053.593.181 1.178.364 1.763a.5.5 0 0 0 .433.585c.608.085 1.211.206 1.793.364.087.028.171-.044.258.057l3.722.06c.007.001.014.002.021.002Z" />
  </svg>
);
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);
// --- ここまでアイコンコンポーネント ---


interface FloatingChatWidgetProps {
  channelId: string;
  currentUser: User | null;
}

export default function FloatingChatWidget({ channelId, currentUser }: FloatingChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // 1. メッセージリストと、取得済みかを管理するStateを追加
  const [messages, setMessages] = useState<MessageWithAuthor[]>([]);
  const [hasFetched, setHasFetched] = useState(false);

  // 2. チャットが初めて開かれた時に、初期メッセージを取得する
  useEffect(() => {
    if (isOpen && !hasFetched) {
      const fetchInitialMessages = async () => {
        const { data, error } = await supabase
          .from('messages') // テーブル名はご自身のものに合わせてください
          .select(`
            *,
            author:users(id, name)
          `)
          .eq('channelId', channelId)
          .order('createdAt', { ascending: true });

        if (error) {
          console.error("Failed to fetch initial messages:", error);
        } else if (data) {
          setMessages(data as MessageWithAuthor[]);
        }
        setHasFetched(true); // 取得完了のフラグを立てる
      };

      fetchInitialMessages();
    }
  }, [isOpen, hasFetched, channelId]);
  
  // ユーザーがログインしていない場合は何も表示しない
  if (!currentUser) {
    return null;
  }

  const handleClose = () => setIsOpen(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-4"> {/* left-4 から right-4 に変更 */}
      {/* チャットウィンドウのコンテナ */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* isOpenがtrue、かつデータ取得が完了したらChatWidgetを描画 */}
        {isOpen && hasFetched && (
          <ChatWindow
            initialMessages={messages}
            channelId={channelId}
            currentUserId={currentUser.id}
            onClose={handleClose} // 閉じる関数を渡す
          />
        )}
      </div>

      {/* 開閉ボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 text-white bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={isOpen ? "チャットを閉じる" : "チャットを開く"}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </button>
    </div>
  );
}