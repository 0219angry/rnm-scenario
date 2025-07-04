// components/ChatWidget.tsx

import { FormEvent, useRef, useEffect } from 'react';
import type { Message as MessageType, User } from '@prisma/client';
import { XMarkIcon } from '@heroicons/react/24/solid';

// 型定義
export type AuthorInfo = Pick<User, 'id' | 'name'>;
export type MessageWithAuthor = MessageType & {
  author: AuthorInfo | null; // authorはnullの可能性も考慮
};

type Props = {
  messages: MessageWithAuthor[];
  currentUser: User;
  channelName: string;
  newMessage: string;
  setNewMessage: (value: string) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
};

// --- ローディングスピナーのコンポーネント ---
const Spinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
  </div>
);

export function ChatWindow({ 
  messages, 
  currentUser, 
  channelName,
  newMessage, 
  setNewMessage, 
  handleSubmit, 
  onClose,
  isLoading
}: Props) {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // メッセージリストが更新されるたびに最下部にスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="bg-white w-80 h-[28rem] rounded-lg shadow-xl flex flex-col">
      {/* ヘッダー */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center rounded-t-lg">
        <h3 className="font-bold text-lg">{channelName}</h3>
        <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded-full">
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            {messages.map((msg) => {
              const isMe = msg.authorId === currentUser.id;
              return (
                <div key={msg.id} className={`flex items-end mb-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-3 py-2 rounded-lg ${isMe ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                    {/* authorがnullでないことを確認 */}
                    <p className="text-sm font-bold">{msg.author?.name || 'Unknown'}</p>
                    <p>{msg.content}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
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
  );
}