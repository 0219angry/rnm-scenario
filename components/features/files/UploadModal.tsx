'use client';

import { useState, useEffect, useRef, DragEvent } from 'react';
import { FaUpload } from 'react-icons/fa';
import { FiFile, FiX } from 'react-icons/fi';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FileInfo } from '../sessions/SessionFileList';

type Props = {
  sessionId: string;
  onUploadSuccess: (newFile: FileInfo) => void; 
};

export function UploadFileModal({ sessionId, onUploadSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false); // ドラッグ状態の管理

  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // input要素への参照
  const supabase = createClientComponentClient();

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    // モーダルを閉じる際に状態をリセット
    setFile(null);
    setMessage(null);
    setUploading(false);
    setIsOpen(false);
  };

  // モーダル開閉制御
  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  // Escキーやダイアログ外クリックで閉じたときの同期
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => closeModal(); // 状態リセットも行う
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, []);

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      setFile(selectedFile);
      setMessage(null); // 新しいファイルが選択されたらメッセージをクリア
    }
  };

  // ドラッグ＆ドロップのイベントハンドラ
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation(); // これも必要
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // アップロード処理
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setMessage(null);

    try {
      // (省略) 既存のアップロードロジックは変更なし
      const res = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          fileName: file.name,
          fileType: file.type,
        }),
      });
      if (!res.ok) throw new Error('署名付きURLの取得に失敗');
      const { signedUrl } = await res.json();
      if (!signedUrl) throw new Error('署名付きURLの取得に失敗');
      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      if (!uploadRes.ok) throw new Error(`アップロード失敗: ${uploadRes.statusText}`);
      // 👇 成功時に新しいファイル情報を作成
      const newFile: FileInfo = {
        name: file.name,
        url: new URL(signedUrl).origin + new URL(signedUrl).pathname, // 署名なしのURLを再構築
        size: file.size,
        mimetype: file.type,
      };
      // 👇 親コンポーネントに通知
      onUploadSuccess(newFile);
      setMessage('アップロードできたよっ🎉');
      setTimeout(() => closeModal(), 1200); // 成功後、少し長めに表示してから閉じる
    } catch (err) {
      console.error(err);
      setMessage(
        err instanceof Error ? err.message : 'アップロードに失敗しました'
      );
      setUploading(false); // 失敗時はアップロード状態を解除
    }
    // finally句は削除し、成功・失敗時に個別対応
  };

  return (
    <>
      {/* 改善されたモーダル表示ボタン */}
      <button
        onClick={openModal}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
      >
        <FaUpload />
        ファイルをアップロード
      </button>

      {/* モーダル本体 */}
      <dialog
        ref={dialogRef}
        className="m-auto w-11/12 max-w-lg rounded-xl bg-white p-0 shadow-2xl backdrop:bg-black/60 dark:bg-gray-800"
      >
        <div className="p-6 md:p-8">
          <h3 className="mb-5 text-xl font-bold text-gray-800 dark:text-white">
            ファイルをアップロード🎁
          </h3>

          {/* ファイル選択エリア */}
          <div className="space-y-4">
            {/* ドラッグ＆ドロップゾーン */}
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()} // クリックでファイル選択を開く
              className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-700'
                }`}
            >
              <FaUpload className="w-10 h-10 text-gray-400 mb-3" />
              <p className="font-bold text-gray-600 dark:text-gray-300">
                ファイルをドラッグ＆ドロップ
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                またはクリックして選択
              </p>
              {/* 実際のinput要素は非表示 */}
              <input
                ref={inputRef}
                type="file"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                disabled={uploading}
                className="hidden"
              />
            </div>

            {/* 選択されたファイルの表示 */}
            {file && !uploading && (
              <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg dark:bg-gray-700">
                <div className="flex items-center gap-3 min-w-0">
                  <FiFile className="text-gray-500 flex-shrink-0" />
                  <p className="text-sm text-gray-800 dark:text-gray-200 truncate">
                    {file.name}
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="p-1 text-gray-500 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
                  aria-label="Remove file"
                >
                  <FiX />
                </button>
              </div>
            )}

            {/* メッセージ表示 */}
            {message && (
              <p
                className={`text-center text-sm font-medium ${
                  message.includes('失敗')
                    ? 'text-red-500'
                    : 'text-green-500'
                }`}
              >
                {message}
              </p>
            )}

            {/* 操作ボタン */}
            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="mt-2 sm:mt-0 w-full sm:w-auto rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:bg-gray-700 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-600"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full sm:w-auto rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'アップロード中…' : 'アップロード'}
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}