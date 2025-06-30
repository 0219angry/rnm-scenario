'use client';

import { useState } from 'react';
import { FileInfo, SessionFileList } from './SessionFileList';
import { UploadFileModal } from '../files/UploadModal';
import { DistributionRulesTable } from './DistributionRulesTable';
import { Player, Trigger} from '@/types/types';
import { FiPlus, FiMinus } from 'react-icons/fi';

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
          players={initialPlayers}
          triggers={triggers} // 動的に生成したトリガーを渡す
          files={files}
        />
      </div>
    </div>
  );
}