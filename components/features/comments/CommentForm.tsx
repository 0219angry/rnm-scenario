'use client';

import { createComment } from '@/lib/comment';
import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import { useRef } from 'react';

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

export function CommentForm({ sessionId }: { sessionId: string }) {
  const [state, dispatch] = useActionState(createComment, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  // 投稿成功時にフォームをリセット
  if (state?.success) {
    formRef.current?.reset();
  }

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
       {state?.errors?.text && <p className="text-red-500 text-sm mt-2">{state.errors.text}</p>}
    </form>
  );
}