'use client';

import { useState } from 'react';
import { FileInfo, SessionFileList } from './SessionFileList';
import { UploadFileModal } from '../files/UploadModal';
import { DistributionRulesTable, Assignment } from './DistributionRulesTable';
import { Player, Trigger} from '@/types/types';
// FiTrash2 アイコンをインポート
import { FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
// prismaはクライアントサイドでは不要なため削除
// import { prisma } from '@/lib/prisma';

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
  const [loading, setLoading] = useState(false);
  const [triggerCount, setTriggerCount] = useState(INITIAL_TRIGGERS);

  const handleUploadSuccess = (newFile: FileInfo) => {
    setFiles((currentFiles) => [...currentFiles, newFile]);
  };

  const triggers: Trigger[] = Array.from({ length: triggerCount }, (_, i) => ({
    id: `trigger-${i + 1}`,
    name: String(i + 1),
  }));

  const handleSetTriggerCount = (count: number) => {
    const newCount = Math.max(MIN_TRIGGERS, Math.min(count, MAX_TRIGGERS));
    setTriggerCount(newCount);
  };

  const handleDeleteAllFiles = async () => {
    // 1. ユーザーに最終確認を行う
    if (!window.confirm(`${files.length}個のファイルをすべて削除します。この操作は元に戻せません。よろしいですか？`)) {
      return;
    }

    setLoading(true);
    const toastId = toast.loading('すべてのファイルを削除しています...');

    try {
      if (files.length === 0) {
        toast.info('削除するファイルがありません。', { id: toastId });
        return;
      }
      
      // 2. 作成したAPIエンドポイントを呼び出す
      const response = await fetch('/api/files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId }), // 'sessionId' を指定
      });

      if (!response.ok) {
        // APIからエラーが返ってきた場合の処理
        const errorData = await response.json();
        throw new Error(errorData.message || 'サーバーでのファイル削除に失敗しました。');
      }
      
      // 3. 成功した場合、ローカルのstateを空にする
      setFiles([]);
      toast.success('すべてのファイルを削除しました。', { id: toastId });

    } catch (error: any) {
      console.error('ファイルの一括削除に失敗しました:', error);
      toast.error(`ファイルの削除に失敗しました: ${error.message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleFileDelete = async (fileName: string) => {
    const filePath = `${sessionId}/${fileName}`;

    // toast.promiseを使って、非同期処理の状態を自動でトーストに反映させる
    toast.promise(
      // 実行する非同期処理
      fetch('/api/files', { // URLを修正
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath }), // 'path' を指定
      }).then(response => {
        // レスポンスがNGならエラーを投げてcatchに処理を移す
        if (!response.ok) {
          return response.json().then(err => {
            throw new Error(err.message || 'ファイルの削除に失敗しました。');
          });
        }
        return response.json();
      }),
      {
        // 各状態でのメッセージ
        loading: `ファイル「${fileName}」を削除しています...`,
        success: (data) => {
          // ★ 成功時にローカルのstateを更新してUIからファイルを消す
          setFiles(currentFiles => currentFiles.filter(f => f.name !== fileName));
          return `ファイル「${fileName}」を削除しました。`;
        },
        error: (err) => `エラー: ${err.message}`,
      }
    );
  };


  const handleActivateTrigger = async (
    triggerId: string,
    triggerName: string,
    assignments: Assignment[]
  ) => {
    setLoading(true);
    const toastId = toast.loading(
      `トリガー「${triggerId}. ${triggerName}」: ${assignments.length}件の通知を送信中です...`
    );

    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'セッションデータの取得に失敗しました。');
      }
      const session = await response.json();

      const notificationPromises = assignments.map(assignment => {
        const message = `
          ${session?.title} / ${session?.scenario.title}で
          ファイル「${assignment.fileName}」があなたに共有されました。
        `;
        const { data } = supabase
          .storage
          .from('session-files')
          .getPublicUrl(`${assignment.sessionId}/${assignment.fileName}`);

        const linkUrl = data.publicUrl;

        return fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toUserId: assignment.playerId,
            message: message,
            linkUrl: linkUrl,
          }),
        });
      });

      const results = await Promise.allSettled(notificationPromises);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.ok).length;
      const failureCount = assignments.length - successCount;

      if (failureCount === 0) {
        toast.success(
          `トリガー「${triggerName}」: ${successCount}件すべての通知を送信しました。`,
          { id: toastId }
        );
      } else {
        toast.error(
          `トリガー「${triggerName}」: ${successCount}件成功, ${failureCount}件失敗しました。`,
          { id: toastId, duration: 8000 }
        );
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
      console.error(`トリガー「${triggerName}」の処理中に予期せぬエラーが発生しました。`, error);
      toast.error('通知処理中に予期せぬエラーが発生しました。詳細はコンソールを確認してください。', {
        id: toastId,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:gap-8">
      <aside className="w-full md:w-1/3 flex-shrink-0">
        <div className="space-y-6">
          <UploadFileModal
            sessionId={sessionId}
            onUploadSuccess={handleUploadSuccess}
          />
          {/* ★★★ 追加: 全削除ボタン ★★★ */}
          <div className="flex justify-end">
            <button
              onClick={handleDeleteAllFiles}
              disabled={files.length === 0 || loading}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiTrash2 />
              <span>すべて削除</span>
            </button>
          </div>
          <SessionFileList 
            files={files} 
            loading={loading}
            onFileDelete={handleFileDelete}
          />
        </div>
      </aside>

      <div className="w-full md:w-2/3 mt-8 md:mt-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">配布ルール設定</h2>
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
          triggers={triggers}
          files={files}
          onActivateTrigger={handleActivateTrigger}
        />
      </div>
    </div>
  );
}