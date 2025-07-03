'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CommentForm } from '@/components/features/comments/CommentForm';
import { LocalDateTime } from '@/components/ui/LocalDateTime';
import { Prisma, User } from '@prisma/client';
// ★ 変更点1: useCallbackをインポート
import { useState, useCallback } from 'react'; 

type CommentWithUser = Prisma.CommentGetPayload<{
  include: {
    user: true;
  };
}>;

type CommentSectionProps = {
  initialComments: CommentWithUser[];
  sessionId: string;
  currentUser: User | null;
};

export function CommentSection({ initialComments, sessionId, currentUser }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);

  // ★ 変更点2: handleCommentAdded関数をuseCallbackでラップする
  const handleCommentAdded = useCallback((newComment: CommentWithUser) => {
    // この関数は外部の変数に依存していないため、依存配列は空でOK
    setComments(prevComments => [newComment, ...prevComments]);
  }, []); // 依存配列が空なので、この関数は初回レンダリング時に一度だけ生成される

  return (
    <section className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 space-y-6">
      <h2 className="text-2xl font-bold">コメント</h2>
      
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                <Image
                  src={comment.user.image || `https://avatar.vercel.sh/${comment.user.id}`}
                  alt={comment.user.name || 'avatar'}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold">{comment.user.name}</p>
                  <p className="text-xs text-gray-500">
                    <LocalDateTime utcDate={comment.createdAt} formatStr="yyyy年MM月dd日 HH:mm" />
                  </p>
                </div>
                <p className="mt-1 whitespace-pre-wrap">{comment.text}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">まだコメントはありません。</p>
        )}
      </div>

      {currentUser ? (
        <CommentForm 
          sessionId={sessionId} 
          onCommentAdded={handleCommentAdded} // メモ化された関数を渡す
        />
      ) : (
        <p className="text-center mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          コメントするには<Link href="/signin" className="text-blue-500 hover:underline">ログイン</Link>が必要です。
        </p>
      )}
    </section>
  );
}