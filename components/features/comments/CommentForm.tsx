'use client';

import { createComment } from '@/lib/comment';
import { useFormStatus } from 'react-dom';
import { useActionState, useEffect, useRef } from 'react'; // ★ 変更点1: useEffectをインポート
import { Prisma } from '@prisma/client';

// ★ 変更点2: 親コンポーネントから渡される型を定義
type CommentWithUser = Prisma.CommentGetPayload<{ include: { user: true } }>;

// useActionStateが管理するstateの型
type CreateCommentState = {
  // バリデーションエラーがある場合
  errors?: {
    text?: string[];
  };
  // 一般的なエラーメッセージがある場合
  error?: string;
  // 成功した場合
  success?: boolean;
  data?: CommentWithUser;
} | undefined; // 初期状態はundefined

type Props = {
  sessionId: string;
  onCommentAdded: (newComment: CommentWithUser) => void; // コメント追加を通知するコールバック関数
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
    >
      {pending ? '投稿中...' : 'コメントする'}
    </button>
  );
}

export function CommentForm({ sessionId, onCommentAdded }: Props) {
  // ★ 変更点3: createCommentから返されるデータ型をジェネリクスで指定
  const [state, dispatch] = useActionState<CreateCommentState, FormData>(createComment, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  // ★ 変更点4: useEffectを使って、stateの変更を監視する
  useEffect(() => {
    // stateにsuccessフラグと新しいコメントデータがあれば処理実行
    if (state?.success && state.data) {
      // 親コンポーネントに新しいコメントデータを渡す
      onCommentAdded(state.data);
      // フォームをリセット
      formRef.current?.reset();
    }
  }, [state, onCommentAdded]); // stateかonCommentAddedが変更された時に実行

  // フォームリセットロジックをuseEffectに移動したため、ここは削除

  return (
    <form
      ref={formRef}
      action={dispatch}
      className="mt-6"
    >
      <input type="hidden" name="sessionId" value={sessionId} />
      <div>
        <label htmlFor="text" className="block text-sm font-medium mb-1">
          コメントを追加
        </label>
        <textarea
          id="text"
          name="text"
          rows={3}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
          placeholder="セッションについての感想や質問など..."
          required
        />
      </div>
      <div className="mt-2 flex justify-end">
        <SubmitButton />
      </div>
        {state?.error && <p className="text-red-500 text-sm mt-2">{state.error}</p>}
        {state?.errors?.text && <p className="text-red-500 text-sm mt-2">{state.errors.text[0]}</p>}
    </form>
  );
}