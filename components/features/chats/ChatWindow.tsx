import type { Message as MessageType, User } from '@prisma/client';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid'; 
import Image from "next/image";
import { FormEvent, useRef, useEffect, Fragment } from 'react'; // Fragmentを追加
import { Listbox, Transition } from '@headlessui/react'; // Listboxをインポート
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'; // アイコンをインポート


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
  participants: AuthorInfo[]; // ★参加者リスト
  selectedRecipient: AuthorInfo | null; // ★選択中の宛先
  setSelectedRecipient: (recipient: AuthorInfo | null) => void; // ★宛先を変更する関数
};

// --- ローディングスピナー ---
const Spinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
  </div>
);

// --- ChatWindowコンポーネント ---
export function ChatWindow({ 
  messages, 
  currentUser, 
  channelName,
  newMessage, 
  setNewMessage, 
  handleSubmit, 
  onClose,
  isLoading,
  participants,
  selectedRecipient,
  setSelectedRecipient
}: Props) {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 自分以外の参加者リスト
  const recipientOptions = participants.filter(p => p.id !== currentUser.id);

  return (
    <div className="bg-white w-full h-full flex flex-col">
      <header className="bg-indigo-600 text-white p-3 flex justify-between items-center border-b border-indigo-700 shadow-sm">
        <h3 className="font-bold text-lg truncate">{channelName}</h3>
        <button onClick={onClose} className="hover:bg-indigo-700 p-1.5 rounded-full transition-colors">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </header>

      <main className="flex-grow p-4 overflow-y-auto bg-gray-100">
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isMe = msg.authorId === currentUser.id;

              // msg.createdAtが有効な日付かチェックする
              const createdAtDate = msg.createdAt ? new Date(msg.createdAt) : null;
              const isValidDate = createdAtDate && !isNaN(createdAtDate.getTime());

              // 有効な日付の場合のみ時刻をフォーマットし、無効な場合は空文字にする
              const timeString = isValidDate
                ? createdAtDate.toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : ''; 

              return (
                <div 
                  key={msg.id} 
                  className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <Image
                      src={msg.author?.image || `https://avatar.vercel.sh/${msg.author?.id}`}
                      alt={msg.author?.name || 'Avatar'}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full self-start"
                    />
                  )}

                  <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isMe && (
                      <span className="text-xs text-gray-600 px-2 mb-0.5">
                        {msg.author?.name || 'Unknown'}
                      </span>
                    )}
                    
                    <div className="flex items-end gap-2">
                      {isMe && (
                        <time className="text-xs text-gray-400 whitespace-nowrap">
                          {timeString}
                        </time>
                      )}

                      <div 
                        className={`px-3 py-2 text-base ${isMe 
                          ? 'bg-indigo-500 text-white rounded-2xl rounded-br-none' 
                          : 'bg-white text-black rounded-2xl rounded-bl-none shadow-sm'}`
                        }
                      >
                        <p>{msg.content}</p>
                      </div>

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

      <footer className="p-2 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">

          <div className="relative">
            <Listbox value={selectedRecipient} onChange={setSelectedRecipient}>
              <Listbox.Button className="relative w-full cursor-default rounded-full bg-gray-100 py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:text-sm h-9">
                <span className="block truncate text-gray-500 text-xs">
                  {selectedRecipient ? selectedRecipient.name : '全員'}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </Listbox.Button>
              <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                <Listbox.Options className="absolute bottom-full mb-1 max-h-60 w-48 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                  {/* 「全員」オプション */}
                  <Listbox.Option
                    className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'}`}
                    value={null}
                  >
                    {({ selected }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>全員</span>
                        {selected ? <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600"><CheckIcon className="h-5 w-5" aria-hidden="true" /></span> : null}
                      </>
                    )}
                  </Listbox.Option>
                  {/* 参加者オプション */}
                  {recipientOptions.map((person) => (
                    <Listbox.Option
                      key={person.id}
                      // 'active' を使って、ホバー時に背景色が変わるようにする
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                        }`
                      }
                      value={person}
                    >
                      {({ selected }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>全員</span>
                        {selected ? <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600"><CheckIcon className="h-5 w-5" aria-hidden="true" /></span> : null}
                      </>
                    )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </Listbox>
          </div>

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

// `https://avatar.vercel.sh/${msg.author?.id}`