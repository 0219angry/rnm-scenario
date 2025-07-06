'use client';

import { useState, useEffect, FormEvent } from 'react';
import type { User, Message as MessageType } from '@prisma/client';
import { supabase } from '@/lib/supabase';
import { ChatWindow, MessageWithAuthor, AuthorInfo } from './ChatWindow';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// --- アイコンコンポーネント ---
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

// --- Propsの型定義 ---
interface FloatingChatWidgetProps {
  channelId: string;
  currentUser: User | null;
}

export default function FloatingChatWidget({ channelId, currentUser }: FloatingChatWidgetProps) {
  // --- State管理 ---
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [channelName, setChannelName] = useState('チャット');
  const [messages, setMessages] = useState<MessageWithAuthor[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [usersCache, setUsersCache] = useState<Map<string, AuthorInfo>>(new Map());

  // --- 1. 初期データ読み込み ---
  useEffect(() => {
    if (!isOpen || !currentUser) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [channelRes, messagesRes] = await Promise.all([
          supabase.from('channels').select('name').eq('id', channelId).single(),
          fetch(`/api/messages?channelId=${channelId}`)
        ]);

        if (channelRes.data) {
          setChannelName(channelRes.data.name || 'チャット');
        }

        if (!messagesRes.ok) throw new Error('Failed to fetch messages');
        const loadedMessages: MessageWithAuthor[] = await messagesRes.json();
        setMessages(loadedMessages);
        
        const newCache = new Map<string, AuthorInfo>();
        loadedMessages.forEach(msg => {
          if (msg.author) newCache.set(msg.author.id, msg.author);
        });
        if (currentUser) {
          newCache.set(currentUser.id, { id: currentUser.id, name: currentUser.name, image: currentUser.image });
        }
        setUsersCache(newCache);

      } catch (error) {
        console.error("Failed to load chat data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen, channelId, currentUser]);

  // --- 2. リアルタイムリスナー設定 ---
  useEffect(() => {
    if (!isOpen || !currentUser) return;

    const handleNewMessage = async (payload: RealtimePostgresChangesPayload<MessageType>) => {
      const newMessagePayload = payload.new as MessageType;
      if (newMessagePayload.authorId === currentUser.id) return;

      let author = usersCache.get(newMessagePayload.authorId);
      if (!author) {
        const { data } = await supabase.from('users').select('id, name, image').eq('id', newMessagePayload.authorId).single();
        author = data || { id: newMessagePayload.authorId, name: 'Unknown', image: null };
        setUsersCache(prev => new Map(prev).set(author!.id, author!));
      }
      setMessages(prev => [...prev, { ...newMessagePayload, author }]);
    };

    const subscription = supabase
      .channel(`chat-room-${channelId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `channelId=eq.${channelId}` }, handleNewMessage)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [isOpen, channelId, currentUser, usersCache]);

  // --- 3. メッセージ送信処理 ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !currentUser) return;

    const optimisticMessage: MessageWithAuthor = {
      id: `temp-${Date.now()}`,
      content: newMessage,
      channelId: channelId,
      authorId: currentUser.id,
      createdAt: new Date(),
      recipientId: null,
      author: { id: currentUser.id, name: currentUser.name || 'No Name', image: currentUser.image },
    };

    setMessages(prev => [...prev, optimisticMessage]);
    const messageToSend = newMessage;
    setNewMessage('');

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageToSend, channelId: channelId }),
      });

      if (!response.ok) throw new Error('Failed to send message to the server.');

      const savedMessage: MessageType = await response.json();
      
      // 先行表示していたメッセージを、サーバーからの正式なデータで置き換える
      // この際、先行表示で使っていたauthor情報を引き継ぐ
      setMessages(prev => prev.map(m => 
        m.id === optimisticMessage.id 
          ? { ...savedMessage, author: optimisticMessage.author } 
          : m
      ));

    } catch (error) {
      console.error('Failed to send message:', error);
      // エラー時は先行表示したメッセージを削除し、入力内容を復元
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      setNewMessage(messageToSend);
    }
  };

  if (!currentUser) return null;

  // --- JSXによるレンダリング ---
  return (
    <div className="fixed bottom-0 right-8 z-50 flex flex-col items-end">
      <div className={`transition-all duration-300 ease-in-out mb-2 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="w-80 h-[30rem] rounded-xl shadow-2xl overflow-hidden">
          {isOpen && (
            <ChatWindow
              messages={messages}
              currentUser={currentUser}
              channelName={channelName}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              handleSubmit={handleSubmit}
              onClose={() => setIsOpen(false)}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-6 py-3 font-bold text-white bg-indigo-600 rounded-t-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        aria-label={isOpen ? "チャットを閉じる" : "チャットを開く"}
      >
        {isOpen ? (
          <>
            <CloseIcon />
            <span>閉じる</span>
          </>
        ) : (
          <>
            <ChatIcon />
            <span>チャット</span>
          </>
        )}
      </button>
    </div>
  );
}