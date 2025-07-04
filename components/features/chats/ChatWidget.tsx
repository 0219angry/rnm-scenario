// components/ChatWidget.tsx

import { useState, useEffect, FormEvent, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { Message as MessageType, User } from '@prisma/client';
import { XMarkIcon } from '@heroicons/react/24/solid';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// 必要な型定義
export type AuthorInfo = Pick<User, 'id' | 'name'>;
export type MessageWithAuthor = MessageType & {
  author: AuthorInfo;
};

type Props = {
  initialMessages: MessageWithAuthor[];
  currentUser: User;
  channelId: string;
  onClose: () => void; // 親から受け取り
};

export function ChatWindow({ initialMessages, currentUser, channelId, onClose }: Props) {
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
    // 現在のユーザー情報もキャッシュに追加
    if (currentUser) {
      initialCache.set(currentUser.id, { id: currentUser.id, name: currentUser.name || 'No Name' });
    }
    return initialCache;
  });

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // リアルタイムリスナーを設定
  useEffect(() => {
    const usersCacheRef = { current: usersCache };
    usersCacheRef.current = usersCache;

    const handleNewMessage = async (payload: RealtimePostgresChangesPayload<MessageType>) => {
      const newMessage = payload.new as MessageType;
      if (!newMessage) return;
      if (newMessage.authorId === currentUser.id) return; // 自分のメッセージは無視

      let author: AuthorInfo | undefined = usersCacheRef.current.get(newMessage.authorId);

      if (!author) {
        const { data, error } = await supabase
          .from('users')
          .select('id, name')
          .eq('id', newMessage.authorId)
          .single();
        
        if (error) {
          console.error("Failed to fetch author info:", error);
          author = { id: newMessage.authorId, name: 'Unknown User' };
        } else if (data) {
          author = data;
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
  }, [channelId, usersCache, currentUser.id]);

  // メッセージ送信処理（楽観的更新）
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const optimisticMessage: MessageWithAuthor = {
      id: `temp-${Date.now()}`,
      content: newMessage,
      channelId: channelId,
      authorId: currentUser.id,
      createdAt: new Date(),
      author: { id: currentUser.id, name: currentUser.name || 'No Name' },
    };

    setMessages(prevMessages => [...prevMessages, optimisticMessage]);
    setNewMessage('');

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: newMessage,
        channelId: channelId,
      }),
    });

    if (!res.ok) {
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== optimisticMessage.id));
      // TODO: ユーザーにエラーを通知
      console.error("Failed to send message");
    }
  };

  return (
    <div className="bg-white w-80 h-[28rem] rounded-lg shadow-xl flex flex-col">
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center rounded-t-lg">
        <h3 className="font-bold text-lg">チャット</h3>
        <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded-full">
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
        {messages.map((msg) => {
          const isMe = msg.authorId === currentUser.id;
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
  );
}