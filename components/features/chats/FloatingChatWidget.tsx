'use client';

import { useState, useEffect, FormEvent } from 'react';
import type { User, Message as MessageType } from '@prisma/client';
import { supabase } from '@/lib/supabase';
import { ChatWindow, MessageWithAuthor, AuthorInfo } from './ChatWidget';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// --- Icons ---
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

interface FloatingChatWidgetProps {
  channelId: string;
  currentUser: User | null;
}

export default function FloatingChatWidget({ channelId, currentUser }: FloatingChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [channelName, setChannelName] = useState('チャット');
  const [messages, setMessages] = useState<MessageWithAuthor[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [usersCache, setUsersCache] = useState<Map<string, AuthorInfo>>(new Map());

  // 1. チャットを開いた時にチャンネル情報とメッセージ履歴を読み込む
  useEffect(() => {
    if (!isOpen || !currentUser) return;

    const fetchData = async () => {
      setIsLoading(true);

      // チャンネル情報とメッセージ履歴を並行して取得
      const [channelRes, messagesRes] = await Promise.all([
        supabase.from('channels').select('name').eq('id', channelId).single(),
        supabase.from('messages').select('*, author:users(id, name)').eq('channelId', channelId).order('createdAt', { ascending: true })
      ]);

      // チャンネル名を設定
      if (channelRes.data) {
        setChannelName(channelRes.data.name || 'チャット');
      }

      // メッセージとユーザーキャッシュを設定
      if (messagesRes.data) {
        const loadedMessages = messagesRes.data as MessageWithAuthor[];
        setMessages(loadedMessages);
        
        const newCache = new Map<string, AuthorInfo>();
        loadedMessages.forEach(msg => {
          if (msg.author) {
            newCache.set(msg.author.id, msg.author);
          }
        });
        // 現在のユーザーもキャッシュに追加
        newCache.set(currentUser.id, { id: currentUser.id, name: currentUser.name || 'No Name' });
        setUsersCache(newCache);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [isOpen, channelId, currentUser]);

  // 2. リアルタイムリスナーを設定
  useEffect(() => {
    if (!isOpen || !currentUser) return;

    const handleNewMessage = async (payload: RealtimePostgresChangesPayload<MessageType>) => {
      const newMessagePayload = payload.new as MessageType;
      if (newMessagePayload.authorId === currentUser.id) return; // 自分の楽観的更新と重複させない

      let author = usersCache.get(newMessagePayload.authorId);
      if (!author) {
        const { data, error } = await supabase.from('users').select('id, name').eq('id', newMessagePayload.authorId).single();
        if (data) {
          author = data;
          setUsersCache(prev => new Map(prev).set(data.id, data));
        } else {
          console.error('Error fetching author for realtime message:', error);
          author = { id: newMessagePayload.authorId, name: 'Unknown' };
        }
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

  // 3. メッセージ送信処理
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !currentUser) return;

    const optimisticMessage: MessageWithAuthor = {
      id: `temp-${Date.now()}`,
      content: newMessage,
      channelId: channelId,
      authorId: currentUser.id,
      createdAt: new Date(),
      author: { id: currentUser.id, name: currentUser.name || 'No Name' },
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    const { error } = await supabase.from('messages').insert({ 
      content: newMessage, 
      channelId: channelId, 
      authorId: currentUser.id 
    });

    if (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      // TODO: ユーザーにエラーを通知
    }
  };

  if (!currentUser) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-4">
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
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