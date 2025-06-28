'use client';

import { useState, useEffect, useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { updateYoutubeLink, type FormState } from '@/lib/actions/participantActions';
import { FaEdit } from 'react-icons/fa';

type Props = {
  sessionId: string;
  currentLink: string | null;
};

// フォームの送信ボタン（ローディング状態をハンドリング）
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

export function EditYoutubeLinkModal({ sessionId, currentLink }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const initialState: FormState = { message: '', success: false };
  const [state, formAction] = useActionState(updateYoutubeLink, initialState);

  // isOpenの状態に応じてモーダルダイアログを開閉する
  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal(); // ダイアログを表示
    } else {
      dialogRef.current?.close(); // ダイアログを閉じる
    }
  }, [isOpen]);

  // Server Actionの処理が成功したら、モーダルを閉じる
  useEffect(() => {
    if (state.success) {
      setIsOpen(false);
    }
  }, [state]);

  // dialogがEscキーで閉じられた時にisOpenステートも更新する
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => setIsOpen(false);
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, []);

  return (
    <>
      {/* 編集ボタン（モーダルを開くトリガー） */}
      <button
        onClick={() => setIsOpen(true)}
        title="自分の視点動画リンクを編集"
        className="text-gray-400 transition-colors hover:text-blue-500"
      >
        <FaEdit size={20} />
      </button>

      {/* モーダル本体 */}
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
            {state.message && (
              <p className={`text-sm ${state.success ? 'text-green-500' : 'text-red-500'}`}>
                {state.message}
              </p>
            )}
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