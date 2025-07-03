// components/ChatWidget.tsx

import { useState, useEffect, FormEvent, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Message as MessageType, User } from '@prisma/client';
import { ChatBubbleOvalLeftEllipsisIcon, XMarkIcon } from '@heroicons/react/24/solid';

// 必要な型定義
export type AuthorInfo = Pick<User, 'id' | 'name'>;
export type MessageWithAuthor = MessageType & {
  author: AuthorInfo;
};

type Props = {
  initialMessages: MessageWithAuthor[];
  currentUserId: string;
  channelId: string;
};

export function ChatWidget({ initialMessages, currentUserId, channelId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MessageWithAuthor[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  
  // ユーザー情報をキャッシュするためのState (Mapを使用)
  const [usersCache, setUsersCache] = useState<Map<string, AuthorInfo>>(() => {
    const initialCache = new Map<string, AuthorInfo>();
    initialMessages.forEach(msg => {
      if (msg.author && !initialCache.has(msg.authorId)) {
        initialCache.set(msg.authorId, msg.author);
      }
    });
    return initialCache;
  });

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // メッセージリストの最下部にスクロールする関数
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // リアルタイムリスナーを設定
  useEffect(() => {
    // 安定して最新のキャッシュにアクセスするための工夫
    const usersCacheRef = { current: usersCache };
    usersCacheRef.current = usersCache;

    const handleNewMessage = async (payload: any) => {
      const newMessage = payload.new as MessageType;
      let author: AuthorInfo | undefined = usersCacheRef.current.get(newMessage.authorId);

      // キャッシュにユーザー情報がない場合のみDBから取得
      if (!author) {
        const { data, error } = await supabase
          .from('users') // あなたのユーザーテーブル名に合わせてください
          .select('id, name')
          .eq('id', newMessage.authorId)
          .single();
        
        if (error) {
          console.error("Failed to fetch author info:", error);
          author = { id: newMessage.authorId, name: 'Unknown User' };
        } else if (data) {
          author = data;
          // 新しく取得したユーザー情報をキャッシュに追加
          // 関数型更新を使い、常に最新のキャッシュから更新する
          setUsersCache(prevCache => new Map(prevCache).set(author!.id, author!));
        }
      }

      const messageWithAuthor = {
        ...newMessage,
        author: author || { id: newMessage.authorId, name: 'Unknown User' },
      };

      setMessages((prevMessages) => [...prevMessages, messageWithAuthor]);
    };

    const channel = supabase
      .channel(`chat-room-${channelId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `channelId=eq.${channelId}` },
        handleNewMessage
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // 依存配列からusersCacheを外し、不要な再購読を防ぐ
  }, [channelId]); 

  // チャットが開かれた時、または新しいメッセージが追加された時にスクロール
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, scrollToBottom]);

  // メッセージ送信処理
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: newMessage,
        channelId: channelId,
      }),
    });

    setNewMessage('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* チャットウィンドウ */}
      <div
        className={`bg-white w-80 h-[28rem] rounded-lg shadow-xl flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        {/* ヘッダー */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center rounded-t-lg cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <h3 className="font-bold text-lg">チャット</h3>
          <button className="hover:bg-blue-700 p-1 rounded-full">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* メッセージリスト */}
        <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
          {messages.map((msg) => {
            const isMe = msg.authorId === currentUserId;
            return (
              <div key={msg.id} className={`flex items-end mb-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-3 py-2 rounded-lg ${isMe ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                  <p className="text-sm font-bold">{msg.author?.name || 'Unknown'}</p>
                  <p>{msg.content}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* 入力フォーム */}
        <form onSubmit={handleSubmit} className="p-2 border-t flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-grow px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 disabled:bg-blue-300"
            disabled={!newMessage.trim()}
          >
            送信
          </button>
        </form>
      </div>

      {/* 開閉ボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-4 shadow-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
        }`}
      >
        <ChatBubbleOvalLeftEllipsisIcon className="h-8 w-8" />
      </button>
    </div>
  );
}