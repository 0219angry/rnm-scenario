'use client';

import { useState } from 'react';
import { FileInfo, SessionFileList } from './SessionFileList';
import { UploadFileModal } from '../files/UploadModal';
import { DistributionRulesTable, Assignment } from './DistributionRulesTable';
import { Player, Trigger} from '@/types/types';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

const INITIAL_TRIGGERS = 5;
const MAX_TRIGGERS = 10;
const MIN_TRIGGERS = 1;


type Props = {
  sessionId: string;
  initialPlayers: Player[];
  initialFiles: FileInfo[];
};

export function FileManager({
  sessionId,
  initialPlayers,
  initialFiles,
}: Props) {
  const [files, setFiles] = useState<FileInfo[]>(initialFiles);
  const [loading, setLoading] = useState(false); // 必要であればローディング状態も管理
  const [triggerCount, setTriggerCount] = useState(INITIAL_TRIGGERS);

  // ファイルがアップロードされたときに呼ばれる関数
  const handleUploadSuccess = (newFile: FileInfo) => {
    // ファイルリストの末尾に新しいファイルを追加して更新
    setFiles((currentFiles) => [...currentFiles, newFile]);
  };

  // 👇 stateに基づいてトリガーの配列を動的に生成
  const triggers: Trigger[] = Array.from({ length: triggerCount }, (_, i) => ({
    id: `trigger-${i + 1}`,
    name: String(i + 1),
  }));

  // 👇 列数を変更するハンドラ
  const handleSetTriggerCount = (count: number) => {
    const newCount = Math.max(MIN_TRIGGERS, Math.min(count, MAX_TRIGGERS));
    setTriggerCount(newCount);
  };

/**
 * トリガー発動関数（個別通知APIを利用するように改良）
 */
const handleActivateTrigger = async (
  triggerId: string,
  triggerName: string,
  assignments: Assignment[] // 子コンポーネントから配布リストを直接受け取る
) => {
  // 1. 処理開始をユーザーに通知（ローディング状態のトーストを表示）
  setLoading(true);
  const toastId = toast.loading(
    `トリガー「${triggerId}. ${triggerName}」: ${assignments.length}件の通知を送信中です...`
  );


  // APIエンドポイントを呼び出す
  const response = await fetch(`/api/sessions/${sessionId}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'データの取得に失敗しました。');
  }
  const session = await response.json();


  try {
    // 2. 配布リストの各項目に対して、個別通知APIの呼び出しプロミスを作成
    const notificationPromises = assignments.map(assignment => {
      
      // 各ユーザーへの通知メッセージとリンクURLを生成
      const message = `
        ${session?.title} / ${session?.scenario.title}で
        ファイル「${assignment.fileName}」があなたに共有されました。
      `;
      // ファイル詳細ページなど、実際のアプリケーションのパス構造に合わせる
      const { data } = supabase
        .storage
        .from('session-files') // ★★★ あなたのバケット名に変更 ★★★
        .getPublicUrl(`${assignment.sessionId}/${assignment.fileName}`); // ファイル名（またはファイルパス）を指定

      const linkUrl = data.publicUrl;

      // 個別通知作成APIを呼び出す
      return fetch('/api/notifications', { // ★こちらのエンドポイントを使用
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toUserId: assignment.playerId,
          message: message,
          linkUrl: linkUrl,
        }),
      });
    });

    // 3. 全てのAPIリクエストが完了するのを待つ (一部が失敗しても処理を続行)
    const results = await Promise.allSettled(notificationPromises);

    // 4. APIリクエストの結果を集計
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.ok).length;
    const failureCount = assignments.length - successCount;

    // 5. 結果に応じたフィードバックをトーストで表示
    if (failureCount === 0) {
      // 全て成功した場合
      toast.success(
        `トリガー「${triggerName}」: ${successCount}件すべての通知を送信しました。`,
        { id: toastId } // ローディングトーストを成功トーストに置き換え
      );
    } else {
      // 一部または全部が失敗した場合
      toast.error(
        `トリガー「${triggerName}」: ${successCount}件成功, ${failureCount}件失敗しました。`,
        { id: toastId, duration: 8000 } // エラーは少し長めに表示
      );
      
      // 失敗したリクエストの詳細を開発者向けにコンソールに出力
      results.forEach((result, index) => {
        if (result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.ok)) {
          console.error(
            `[通知失敗] ユーザーID: ${assignments[index].playerId}`,
            result
          );
        }
      });
    }
  } catch (error) {
    // ネットワークエラーなど、予期せぬエラーが発生した場合
    console.error(`トリガー「${triggerName}」の処理中に予期せぬエラーが発生しました。`, error);
    toast.error('通知処理中に予期せぬエラーが発生しました。詳細はコンソールを確認してください。', {
      id: toastId,
    });
    // 子コンポーネントにエラーを伝播させ、ボタンのローディング状態などを解除させる
    throw error;
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex flex-col md:flex-row md:gap-8">
      {/* --- 左カラム (3割) --- */}
      <aside className="w-full md:w-1/3 flex-shrink-0">
        <div className="space-y-6">
          <UploadFileModal
            sessionId={sessionId}
            onUploadSuccess={handleUploadSuccess}
          />
          <SessionFileList files={files} loading={loading} />
        </div>
      </aside>

      {/* --- 右カラム --- */}
      <div className="w-full md:w-2/3 mt-8 md:mt-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">配布ルール設定</h2>
          
          {/* 👇 列数調整UIを追加 */}
          <div className="flex items-center gap-2">
            <label htmlFor="trigger-count" className="text-sm font-medium text-gray-700">列数:</label>
            <button
              onClick={() => handleSetTriggerCount(triggerCount - 1)}
              disabled={triggerCount <= MIN_TRIGGERS}
              className="p-1.5 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              aria-label="列を減らす"
            >
              <FiMinus />
            </button>
            <input
              id="trigger-count"
              type="number"
              value={triggerCount}
              onChange={(e) => handleSetTriggerCount(parseInt(e.target.value, 10) || MIN_TRIGGERS)}
              className="w-16 text-center border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              min={MIN_TRIGGERS}
              max={MAX_TRIGGERS}
            />
             <button
              onClick={() => handleSetTriggerCount(triggerCount + 1)}
              disabled={triggerCount >= MAX_TRIGGERS}
              className="p-1.5 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              aria-label="列を増やす"
            >
              <FiPlus />
            </button>
          </div>
        </div>
        
        <DistributionRulesTable
          sessionId={sessionId}
          players={initialPlayers}
          triggers={triggers} // 動的に生成したトリガーを渡す
          files={files}
          onActivateTrigger={handleActivateTrigger}
        />
      </div>
    </div>
  );
}