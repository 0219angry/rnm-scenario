'use client';

import { useState, useEffect, useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { updateYoutubeLink, type FormState } from '@/lib/actions/participantActions'; // Server Actionをインポート

// --- アイコンのインポート ---
import { FaYoutube } from 'react-icons/fa';
import { PencilIcon } from '@heroicons/react/24/solid'; // ★ 不足していたパスを修正

// --- 型定義 ---
type Props = {
  sessionId: string;
  currentLink: string | null;
  asMenuItem?: boolean; // メニュー項目として表示するかどうかのフラグ
};

// --- 送信ボタンコンポーネント ---
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
    >
      {pending ? '保存中...' : '保存する'}
    </button>
  );
}

// --- メインコンポーネント本体 ---
export function EditYoutubeLinkModal({ sessionId, currentLink, asMenuItem = false }: Props) {
  // --- フック定義 ---
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Server Actionの状態管理
  const initialState: FormState = { message: '', success: false };
  const [state, formAction] = useActionState(updateYoutubeLink, initialState);

  // ---副作用フック (useEffect) ---

  // isOpen stateに応じて<dialog>要素の開閉を制御
  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  // Server Actionが成功したらモーダルを閉じる
  useEffect(() => {
    if (state.success) {
      setIsOpen(false);
    }
  }, [state]);

  // ESCキーでダイアログが閉じられた時に、isOpen stateも同期させる
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => setIsOpen(false);
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, []);


  // --- レンダリング ---
  return (
    <>
      {/* モーダルを開くトリガーボタン */}
      {asMenuItem ? (
        // メニュー項目として表示する場合
        <button
          onClick={() => setIsOpen(true)}
          className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900 hover:bg-gray-100"
        >
          <FaYoutube className="mr-2 h-5 w-5 text-red-500" />
          YouTubeリンクを編集
        </button>
      ) : (
        // 通常のアイコンボタンとして表示する場合
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
          title="YouTubeリンクを編集"
        >
          <PencilIcon className="h-4 w-4 text-gray-500" />
        </button>
      )}

      {/* モーダルダイアログ本体 */}
      <dialog
        ref={dialogRef}
        className="m-auto w-11/12 max-w-md rounded-lg bg-white p-0 shadow-xl backdrop:bg-black/50 dark:bg-gray-800"
      >
        <div className="p-6">
          <h3 className="mb-4 text-lg font-bold">視点動画リンクを編集</h3>
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="sessionId" value={sessionId} />
            <div>
              <label htmlFor="youtubeLink" className="mb-2 block text-sm font-medium">
                YouTube URL
              </label>
              <input
                id="youtubeLink"
                name="youtubeLink"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                defaultValue={currentLink ?? ''}
                className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            
            {/* サーバーからのメッセージ表示 */}
            {state.message && (
              <p className={`text-sm ${state.success ? 'text-green-500' : 'text-red-500'}`}>
                {state.message}
              </p>
            )}

            {/* 操作ボタン */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500"
              >
                キャンセル
              </button>
              <SubmitButton />
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}