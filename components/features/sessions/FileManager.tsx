'use client';

import { useState } from 'react';
import { FileInfo, SessionFileList } from './SessionFileList';
import { UploadFileModal } from '../files/UploadModal';
import { DistributionRulesTable } from './DistributionRulesTable';
import { Player, Trigger} from '@/types/types'

type Props = {
  sessionId: string;
  initialPlayers: Player[];
  initialTriggers: Trigger[];
  initialFiles: FileInfo[];
};

export function FileManager({
  sessionId,
  initialPlayers,
  initialTriggers,
  initialFiles,
}: Props) {
  const [files, setFiles] = useState<FileInfo[]>(initialFiles);
  const [loading, setLoading] = useState(false); // 必要であればローディング状態も管理

  // ファイルがアップロードされたときに呼ばれる関数
  const handleUploadSuccess = (newFile: FileInfo) => {
    // ファイルリストの末尾に新しいファイルを追加して更新
    setFiles((currentFiles) => [...currentFiles, newFile]);
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

      {/* --- 右カラム (7割) --- */}
      <div className="w-full md:w-2/3 mt-8 md:mt-0">
        <h2 className="text-lg font-semibold mb-4">配布ルール設定</h2>
        <DistributionRulesTable
          players={initialPlayers}
          triggers={initialTriggers}
          files={files} // ファイルリストを渡す
        />
      </div>
    </div>
  );
}