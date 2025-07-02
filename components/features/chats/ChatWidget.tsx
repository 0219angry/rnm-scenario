// components/ChatWidget.tsx

import { useState, useEffect, FormEvent, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { messages as Message, User } from '@prisma/client';
import { ChatBubbleOvalLeftEllipsisIcon, XMarkIcon } from '@heroicons/react/24/solid';

type MessageWithAuthor = Message & {
  author: Pick<User, 'id' | 'name'>;
};

type Props = {
  initialMessages: MessageWithAuthor[];
  currentUserId: string;
  // --- 変更点 ---
  // どのチャットチャンネルかを特定するためのID
  channelId: string;
};

export default function ChatWidget({ initialMessages, currentUserId, channelId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MessageWithAuthor[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // --- 変更点 ---
    // リアルタイム購読を特定のチャンネルIDに絞り込みます
    const channel = supabase
      .channel(`chat-room-${channelId}`) // チャンネルごとにユニークな名前をつける
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          // `channelId`が一致するレコードのINSERTのみをリッスンする
          filter: `channelId=eq.${channelId}`,
        },
        (payload) => {
          setMessages((prevMessages) => [...prevMessages, payload.new as MessageWithAuthor]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]); // channelIdが変わったら購読し直す

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    // --- 変更点 ---
    // APIにchannelIdも送信する
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: newMessage,
        authorId: currentUserId,
        channelId: channelId, // どのチャンネルへの投稿かを指定
      }),
    });

    setNewMessage('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <div
        className={`bg-white w-80 h-[28rem] rounded-lg shadow-xl flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center rounded-t-lg cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <h3 className="font-bold text-lg">チャット</h3>
          <button className="hover:bg-blue-700 p-1 rounded-full">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
          {messages.map((msg) => {
            const isMe = msg.authorId === currentUserId;
            return (
              <div key={msg.id} className={`flex items-end mb-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-3 py-2 rounded-lg ${isMe ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
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