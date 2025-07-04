// app/test-chat/page.tsx

'use client'; // イベント処理やフックを扱うためクライアントコンポーネントにします

import { ChatWindow } from '@/components/features/chats/ChatWidget'; // ChatWindowコンポーネントのパスを自身の環境に合わせてください
import type { MessageWithAuthor } from '@/components/features/chats/ChatWidget';
import { useState } from 'react';

// テスト用のダミーメッセージデータ
const mockInitialMessages: MessageWithAuthor[] = [
  {
    id: 'msg-1',
    content: 'こんにちは！これはテストページです。',
    authorId: 'user-A', // 送信者A
    channelId: 'test-channel-123',
    createdAt: new Date(Date.now() - 120000), // 2分前
    author: { id: 'user-A', name: '田中さん' },
  },
  {
    id: 'msg-2',
    content: 'うまく表示されていますか？🤔',
    authorId: 'user-B', // 送信者B (自分)
    channelId: 'test-channel-123',
    createdAt: new Date(Date.now() - 60000), // 1分前
    author: { id: 'user-B', name: '自分' },
  },
];

/**
 * ChatWindowコンポーネントのテスト表示専用ページ
 */
export default function ChatTestPage() {
  // チャットウィンドウの表示/非表示を管理するstate
  const [isChatVisible, setIsChatVisible] = useState(true);

  // 閉じるボタンが押されたときの処理
  const handleCloseChat = () => {
    console.log('チャットウィンドウが閉じられました。');
    setIsChatVisible(false);
  };

  // 表示を再開するためのボタン
  const handleReopenChat = () => {
    setIsChatVisible(true);
  }

  return (
    // 画面全体を使い、コンポーネントを中央に配置するためのスタイリング
    <main className="bg-gray-200 min-h-screen w-full flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">ChatWindow テストページ</h1>
        <p className="text-gray-600">このページではChatWindowコンポーネントの表示と動作を確認できます。</p>
      </div>

      {isChatVisible ? (
        <ChatWindow
          // 必要なpropsを渡します
          initialMessages={mockInitialMessages}
          currentUserId="user-B" // 自分のユーザーIDを 'user-B' に設定
          channelId="test-channel-123" // テスト用のチャンネルID
          onClose={handleCloseChat}
        />
      ) : (
        <div className='text-center'>
            <p className='mb-4'>チャットは非表示です。</p>
            <button
                onClick={handleReopenChat}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
                チャットを再表示
            </button>
        </div>
      )}
    </main>
  );
}