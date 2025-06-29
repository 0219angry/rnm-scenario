'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Player, Trigger } from '@/types/types'; 
import { FileInfo } from './SessionFileList';
import { CustomSelect } from '@/components/ui/CustomSelect'; // 作成したコンポーネントをインポート

// アイコンライブラリ
import { FiFile, FiImage, FiFileText, FiVideo, FiMusic } from 'react-icons/fi';
import { FaFilePdf, FaFileWord, FaFileExcel } from 'react-icons/fa';
import { VscChromeClose } from 'react-icons/vsc';

// --- ヘルパー関数: ファイルタイプに応じたアイコンを返す ---
const getFileIcon = (mimetype: string) => {
  if (mimetype.startsWith('image/')) return <FiImage className="text-pink-500" />;
  if (mimetype.startsWith('video/')) return <FiVideo className="text-indigo-500" />;
  if (mimetype.startsWith('audio/')) return <FiMusic className="text-sky-500" />;
  if (mimetype === 'application/pdf') return <FaFilePdf className="text-red-600" />;
  if (mimetype.includes('word')) return <FaFileWord className="text-blue-600" />;
  if (mimetype.includes('spreadsheet') || mimetype.includes('excel')) return <FaFileExcel className="text-green-600" />;
  if (mimetype.startsWith('text/')) return <FiFileText className="text-gray-600" />;
  return <FiFile className="text-gray-500" />;
};


type Props = {
  players: Player[];
  triggers: Trigger[];
  files: FileInfo[];
};

export function DistributionRulesTable({ players, triggers, files }: Props) {
  const [distributionState, setDistributionState] = useState<
    Record<string, Record<string, string | null>>
  >({});

  // ドラッグ中のターゲットをハイライトするためのState
  const [dragOverTarget, setDragOverTarget] = useState<{
    playerId: string;
    triggerId: string;
  } | null>(null);

  // ファイルの割り当て・解除を行うハンドラ
  const handleFileAssign = (
    playerId: string,
    triggerId: string,
    fileName: string | null
  ) => {
    setDistributionState((prevState) => {
      const playerState = prevState[playerId] || {};
      const newPlayerState = { ...playerState, [triggerId]: fileName };
      console.log(
        `Player ${playerId}のTrigger ${triggerId}にファイル「${fileName}」を割り当て`
      );
      return { ...prevState, [playerId]: newPlayerState };
    });
  };

  // --- ドラッグ＆ドロップのイベントハンドラ ---
  const handleDragOver = (e: React.DragEvent<HTMLTableCellElement>) => {
    e.preventDefault(); // ドロップを許可するために必須
  };

  const handleDragEnter = (playerId: string, triggerId: string) => {
    setDragOverTarget({ playerId, triggerId });
  };

  const handleDragLeave = () => {
    setDragOverTarget(null);
  };

  const handleDrop = (
    e: React.DragEvent<HTMLTableCellElement>,
    playerId: string,
    triggerId: string
  ) => {
    e.preventDefault();
    setDragOverTarget(null); // ハイライトを解除
    // ドラッグされたファイル情報を取得
    const fileInfoJSON = e.dataTransfer.getData('application/json');
    if (fileInfoJSON) {
      const fileInfo: FileInfo = JSON.parse(fileInfoJSON);
      handleFileAssign(playerId, triggerId, fileInfo.name);
    }
  };

  // CustomSelectコンポーネントに渡すための選択肢(options)を生成
  const selectOptions = [
    {
      value: 'none', // 「未選択」を表す特別な値
      label: (
        <div className="flex items-center gap-2 text-gray-500">
          <VscChromeClose />
          <span>未選択</span>
        </div>
      ),
    },
    // アップロードされたファイル一覧をループして選択肢を生成
    ...files.map((file) => ({
      value: file.name,
      label: (
        <div className="flex items-center gap-2">
          {getFileIcon(file.mimetype)}
          <span className="text-xs">{file.name}</span>
        </div>
      ),
    })),
  ];


  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto">
      <table className="w-full min-w-[600px] table-fixed text-sm text-left">
        <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold w-3/12">
              プレイヤー
            </th>
            {triggers.map((trigger) => (
              <th key={trigger.id} scope="col" className="px-4 py-3 font-semibold text-center">
                {trigger.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {players.map((player) => (
            <tr key={player.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="relative w-9 h-9 flex-shrink-0">
                    <Image
                      src={player.avatar_url || '/default-avatar.png'}
                      alt={player.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <span className="text-sm">{player.name}</span>
                </div>
              </td>
              {triggers.map((trigger) => {
                const selectedFileName = distributionState[player.id]?.[trigger.id] || null;
                const selectedFile = files.find(f => f.name === selectedFileName);
                const isDragOver = dragOverTarget?.playerId === player.id && dragOverTarget?.triggerId === trigger.id;

                return (
                  <td
                    key={trigger.id}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, player.id, trigger.id)}
                    onDragEnter={() => handleDragEnter(player.id, trigger.id)}
                    onDragLeave={handleDragLeave}
                    className={`px-2 py-2 text-center align-middle transition-colors ${
                      isDragOver ? 'bg-blue-100' : ''
                    }`}
                  >
                    <div className="w-full h-12 flex items-center justify-center p-1 border-2 border-dashed rounded-md border-transparent data-[drag-over=true]:border-blue-400" data-drag-over={isDragOver}>
                      {selectedFile ? (
                        <div className="relative group w-full flex items-center justify-center gap-2 text-xs bg-gray-100 p-2 rounded">
                          {getFileIcon(selectedFile.mimetype)}
                          <span className="truncate">{selectedFile.name}</span>
                          <button
                            onClick={() => handleFileAssign(player.id, trigger.id, null)}
                            className="absolute top-1 right-1 p-0.5 rounded-full bg-gray-300 text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-opacity"
                            aria-label="割り当て解除"
                          >
                            <VscChromeClose size={12} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">ここにドロップ</span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}