'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Player, Trigger} from '@/types/types'
import { FileInfo } from './SessionFileList'; // FileInfoの型をインポート

type Props = {
  players: Player[];
  triggers: Trigger[];
  files: FileInfo[]; // アップロード済みファイル一覧を受け取る
};

export function DistributionRulesTable({ players, triggers, files }: Props) {
  // stateの型を boolean から string | null (ファイル名) に変更
  const [distributionState, setDistributionState] = useState<
    Record<string, Record<string, string | null>>
  >({});

  // ファイルが選択されたときのハンドラ
  const handleFileSelect = (
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
      // ここでDBを更新する処理を将来的に実装
      return { ...prevState, [playerId]: newPlayerState };
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto">
      <table className="w-full min-w-[600px] table-auto text-sm text-left">
        <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
          <tr>
            <th scope="col" className="px-6 py-3 font-semibold w-1/4">
              プレイヤー
            </th>
            {triggers.map((trigger) => (
              <th key={trigger.id} scope="col" className="px-6 py-3 font-semibold text-center">
                {trigger.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {players.map((player) => (
            <tr key={player.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                {/* ...プレイヤー表示 (変更なし)... */}
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10">
                    <Image
                      src={player.avatar_url || '/default-avatar.png'}
                      alt={player.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <span>{player.name}</span>
                </div>
              </td>
              {triggers.map((trigger) => {
                const selectedFile = distributionState[player.id]?.[trigger.id] || null;
                return (
                  <td key={trigger.id} className="px-6 py-4 text-center">
                    {/* 👇 チェックボックスからselect(ドロップダウン)に変更 */}
                    <select
                      value={selectedFile || ''}
                      onChange={(e) =>
                        handleFileSelect(player.id, trigger.id, e.target.value || null)
                      }
                      className="block w-full text-xs p-2 border border-gray-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">ファイル未選択</option>
                      {files.map((file) => (
                        <option key={file.name} value={file.name}>
                          {file.name}
                        </option>
                      ))}
                    </select>
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