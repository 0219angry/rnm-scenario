'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Player, Trigger } from '@/types/types'; 
import { FileInfo } from './SessionFileList';

// アイコンライブラリ
import { FiPlay, FiCheck, FiFile, FiImage, FiFileText, FiVideo, FiMusic } from 'react-icons/fi';
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

export type Assignment = {
  sessionId: string;
  playerId: string;
  playerName: string;
  fileName: string;
};

type Props = {
  sessionId: string;
  players: Player[];
  triggers: Trigger[];
  files: FileInfo[];
  /**
   * トリガーが発動される際に呼び出される非同期関数
   * @param triggerId 発動するトリガーのID
   * @param triggerName 発動するトリガーの名前
   * @param assignments 作成された配布リスト
   */
  onActivateTrigger: (
    triggerId: string,
    triggerName: string,
    assignments: Assignment[]
  ) => Promise<void>;
};

export function DistributionRulesTable({ sessionId, players, triggers, files,onActivateTrigger }: Props) {
  const [distributionState, setDistributionState] = useState<
    Record<string, Record<string, string | null>>
  >({});

  // ドラッグ中のターゲットをハイライトするためのState
  const [dragOverTarget, setDragOverTarget] = useState<{
    playerId: string;
    triggerId: string;
  } | null>(null);

  // 発動済みのトリガーIDを管理する
  const [activatedTriggers, setActivatedTriggers] = useState<Set<string>>(new Set());
  // 現在処理中のトリガーIDを管理する（連続クリック防止）
  const [activatingTriggerId, setActivatingTriggerId] = useState<string | null>(null);



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
  
  const handleTriggerHeaderClick = async (triggerId: string, triggerName: string) => {
    if (activatedTriggers.has(triggerId) || activatingTriggerId) {
      return;
    }

    // ★★★ このコンポーネント内で配布リストを作成する ★★★
    const assignments: Assignment[] = players
      .map(player => {
        const fileName = distributionState[player.id]?.[triggerId];
        if (fileName) {
          return {
            sessionId: sessionId,
            playerId: player.id,
            playerName: player.name, // デバッグ等で便利なように名前も追加
            fileName: fileName,
          };
        }
        return null;
      })
      // 型安全性を保つために型ガードを使用
      .filter((item): item is Assignment => item !== null);

    // 割り当てがない場合はユーザーに通知して処理を中断
    if (assignments.length === 0) {
      alert('このトリガーにはファイルが割り当てられていません。');
      return;
    }

    // 確認メッセージに配布人数を表示
    const confirmationMessage = `トリガー「${triggerName}」を発動します。
    
${assignments.length}人 のプレイヤーにファイルが配布されます。
この操作は元に戻せません。よろしいですか？`;

    const isConfirmed = window.confirm(confirmationMessage);

    if (isConfirmed) {
      setActivatingTriggerId(triggerId);
      try {
        // ★★★ 親コンポーネントに「配布リスト」を渡す ★★★
        await onActivateTrigger(triggerId, triggerName, assignments);

        setActivatedTriggers((prev) => new Set(prev).add(triggerId));

      } catch (error) {
        console.error(`トリガー「${triggerName}」の発動に失敗しました。`, error);
        alert(`エラー: トリガー「${triggerName}」の発動に失敗しました。`);
      } finally {
        setActivatingTriggerId(null);
      }
    }
  };


  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <table className="w-full min-w-full table-fixed text-sm text-left">
        <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold w-3/12">
              プレイヤー
            </th>
            {/* 【変更点⑤】thの中身を全面的に刷新 */}
            {triggers.map((trigger) => {
              const isActivated = activatedTriggers.has(trigger.id);
              const isActivating = activatingTriggerId === trigger.id;

              return (
                <th
                  key={trigger.id}
                  scope="col"
                  className="px-4 py-3 font-semibold text-center"
                >
                  {/* トリガー名 */}
                  <span className="block truncate mb-2">{trigger.name}</span>
                  
                  {/* 発動状態に応じて表示を切り替え */}
                  <div className="h-8 flex items-center justify-center">
                    {isActivated ? (
                      // 発動済みの表示
                      <div className="flex items-center justify-center gap-1.5 text-green-600 font-normal text-sm">
                        <FiCheck size={16} />
                        <span>完了</span>
                      </div>
                    ) : (
                      // 未発動の場合、ボタンを表示
                      <button
                        type="button"
                        onClick={() => handleTriggerHeaderClick(trigger.id, trigger.name)}
                        disabled={isActivating || !!activatingTriggerId} // 自身または他が処理中なら無効
                        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        title={ isActivating ? '処理中です...' : `トリガー「${trigger.name}」を発動する` }
                      >
                        {isActivating ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>処理中...</span>
                          </>
                        ) : (
                          <>
                            <FiPlay />
                            {triggers.length < 6 ? (
                              <span>送信</span>
                            ) : (
                              <></>
                            )}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {players.map((player) => (
            <tr key={player.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="relative w-9 h-9 flex-shrink-0">
                    <Image
                      src={player.avatar_url ?? `https://avatar.vercel.sh/${player.id}`}
                      alt={player.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{player.name}</span>
                    <div className="flex items-center text-xs text-gray-500">
                      {/* 役職 */}
                      {player.role && (
                        <span className="font-semibold text-blue-600">{player.role}</span>
                      )}
                      
                      {/* ★ 役職とキャラクターの両方がある場合のみ区切り文字を表示 */}
                      {player.role && player.character && (
                        <span className="mx-1">/</span>
                      )}
                      
                      {/* キャラクター名 */}
                      {player.character && (
                        <span>{player.character}</span>
                      )}
                    </div>
                  </div>

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