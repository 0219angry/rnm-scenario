import { FormEvent, useRef, useEffect } from 'react';
import type { Message as MessageType, User } from '@prisma/client';
import { XMarkIcon } from '@heroicons/react/24/solid';

// 型定義
export type AuthorInfo = Pick<User, 'id' | 'name' | 'image'>;
export type MessageWithAuthor = MessageType & {
  author: AuthorInfo | null;
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

      {/* メッセージリスト */}
      <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            {messages.map((msg) => {
              const isMe = msg.authorId === currentUser.id;
              // 投稿時間を見やすい形式にフォーマット
              const timeString = new Date(msg.createdAt).toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                // --- ▼▼▼ 表示部分を修正 ▼▼▼ ---
                <div key={msg.id} className={`flex gap-2.5 mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  
                  {/* アイコン (自分ではない場合) */}
                  {!isMe && (
                    <img 
                      src={msg.author?.image || '/default-avatar.png'} // デフォルト画像へのパス
                      alt={msg.author?.name || 'Avatar'}
                      className="w-8 h-8 rounded-full self-end"
                    />
                  )}

                  {/* メッセージ本文と時間 */}
                  <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`max-w-xs px-3 py-2 rounded-lg ${isMe ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                      {!isMe && (
                        <p className="text-sm font-bold">{msg.author?.name || 'Unknown'}</p>
                      )}
                      <p className="text-base">{msg.content}</p>
                    </div>

                    {/* 投稿時間 */}
                    <time className="text-xs text-gray-400 whitespace-nowrap self-end">
                      {timeString}
                    </time>
                  </div>
                  
                  {/* アイコン (自分の場合) */}
                  {isMe && (
                    <img 
                      src={msg.author?.image || `https://avatar.vercel.sh/${msg.author?.id}`}
                      alt={msg.author?.name || 'Avatar'}
                      className="w-8 h-8 rounded-full self-end"
                    />
                  )}
                  
                </div>
                // --- ▲▲▲ ここまで修正 ▲▲▲ ---
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