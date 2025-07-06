import { FormEvent, useRef, useEffect } from 'react';
import type { Message as MessageType, User } from '@prisma/client';
// [追加] アイコンをインポート
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid'; 

// 型定義 (変更なし)
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

// --- ローディングスピナー (変更なし) ---
const Spinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
  </div>
);

// --- [デザイン全面改修] ChatWindowコンポーネント ---
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

  // メッセージリストが更新されるたびに最下部にスクロール (変更なし)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    // [変更] 全体のコンテナ。h-fullで親の高さに追従
    <div className="bg-white w-full h-full flex flex-col">
      {/* [変更] ヘッダーのデザインを刷新 */}
      <header className="bg-indigo-600 text-white p-3 flex justify-between items-center border-b border-indigo-700 shadow-sm">
        <h3 className="font-bold text-lg truncate">{channelName}</h3>
        <button onClick={onClose} className="hover:bg-indigo-700 p-1.5 rounded-full transition-colors">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </header>

      {/* [変更] メッセージリストのデザインを刷新 */}
      <main className="flex-grow p-4 overflow-y-auto bg-gray-100">
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isMe = msg.authorId === currentUser.id;
              const timeString = new Date(msg.createdAt).toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                // [変更] メッセージ一行のコンテナ。アバターと吹き出しを配置
                <div 
                  key={msg.id} 
                  className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {/* アバター (相手の場合) */}
                  {!isMe && (
                    <img
                      src={msg.author?.image || `https://avatar.vercel.sh/${msg.author?.id}`}
                      alt={msg.author?.name || 'Avatar'}
                      className="w-8 h-8 rounded-full self-start"
                    />
                  )}

                  {/* 吹き出しと時間 */}
                  <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                    {/* 名前 (相手の場合のみ) */}
                    {!isMe && (
                      <span className="text-xs text-gray-600 px-2 mb-0.5">
                        {msg.author?.name || 'Unknown'}
                      </span>
                    )}
                    
                    <div className="flex items-end gap-2">
                       {/* 時間 (自分の場合) */}
                      {isMe && (
                        <time className="text-xs text-gray-400 whitespace-nowrap">
                          {timeString}
                        </time>
                      )}

                      {/* 吹き出し */}
                      <div 
                        className={`px-3 py-2 text-base ${isMe 
                          ? 'bg-indigo-500 text-white rounded-2xl rounded-br-none' 
                          : 'bg-white text-black rounded-2xl rounded-bl-none shadow-sm'}`
                        }
                      >
                        <p>{msg.content}</p>
                      </div>

                      {/* 時間 (相手の場合) */}
                      {!isMe && (
                        <time className="text-xs text-gray-400 whitespace-nowrap">
                          {timeString}
                        </time>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* [変更] 入力フォームのデザインを刷新 */}
      <footer className="p-2 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="メッセージを入力"
            className="flex-grow px-3 py-2 bg-gray-100 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
            autoComplete="off"
          />
          <button
            type="submit"
            className="flex-shrink-0 w-9 h-9 bg-indigo-500 text-white rounded-full flex items-center justify-center transition-colors hover:bg-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            disabled={!newMessage.trim()}
            aria-label="送信"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
      </footer>
    </div>
  );
}