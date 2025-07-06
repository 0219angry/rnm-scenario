'use client';

import { useRef, useState, useTransition } from 'react';
import { Player } from '@/types/types'; // Player型をインポート

type Props = {
  players: Player[]; // 参加者リストを受け取る
};

// ローディングスピナーコンポーネント
const Spinner = () => (
  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
);

export function NotificationForm({ players }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSending(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const message = formData.get('message') as string;
    const linkUrl = formData.get('url') as string;

    if (!message) {
      setError('メッセージは必須です。');
      setIsSending(false);
      return;
    }

    try {
      // 全参加者に対して、API呼び出しを並行して実行
      const notificationPromises = players.map(player => 
        fetch('/api/notifications', { // ご提示のAPIエンドポイント
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            toUserId: player.id, // 各プレイヤーのIDを指定
            message,
            linkUrl,
          }),
        }).then(res => {
          if (!res.ok) {
            // １件でも失敗したらエラーを投げる
            throw new Error(`ユーザー(${player.name})への通知に失敗しました。`);
          }
          return res.json();
        })
      );
      
      // すべてのAPI呼び出しが完了するのを待つ
      await Promise.all(notificationPromises);

      setSuccess(`${players.length}人の参加者全員に通知を送信しました。`);
      formRef.current?.reset();

    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました。');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6 mt-8 bg-white border rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">参加者への通知送信</h2>
      <form ref={formRef} onSubmit={handleSubmit}>
        {/* エラー・成功メッセージ表示欄 */}
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        {success && <p className="mb-4 text-sm text-green-600">{success}</p>}

        <div className="space-y-4">
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              メッセージ本文
            </label>
            <textarea
              id="message"
              name="message"
              rows={3}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="例：新しい資料をアップロードしました。"
            />
          </div>
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              関連URL（任意）
            </label>
            <input
              type="url"
              id="url"
              name="url"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://example.com"
            />
          </div>
        </div>
        <div className="mt-6">
          <button
            type="submit"
            disabled={isSending}
            className="inline-flex items-center justify-center w-full px-4 py-2 font-semibold text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            {isSending ? <Spinner /> : '全員に送信する'}
          </button>
        </div>
      </form>
    </div>
  );
}