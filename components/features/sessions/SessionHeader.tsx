import Link from 'next/link';
import { SessionJoinButton } from './SessionJoinButton';
import { FiEdit, FiFolder } from 'react-icons/fi';
// Prismaの型をインポート
import { Session, User } from '@prisma/client';

// ★ 修正点1: コンポーネントが受け取るProps全体の型を定義
type Props = {
  // ★ 修正点2: session propの型を、実際に使用するフィールドのみに限定
  session: Pick<Session, 'id' | 'title' | 'isFinished'>;
  isOwner: boolean;
  isParticipant: boolean;
  currentUser: User | null; // User型、または適切な型を指定
};

export function SessionHeader({ session, isOwner, isParticipant, currentUser }: Props) {
  return (
    <header className="border-b border-gray-200 dark:border-gray-700 pb-6 relative">
      {/* --- GM用のアクションボタンエリア --- */}
      {isOwner && (
        <div className="absolute top-0 right-0 flex items-center gap-2 md:gap-4">
          <Link
            href={`/sessions/${session.id}/edit`}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <FiEdit />
            <span>編集</span>
          </Link>
          <Link
            href={`/sessions/${session.id}/filemanager`}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
          >
            <FiFolder />
            <span>ファイル管理</span>
          </Link>
        </div>
      )}
      
      <h1 className="text-3xl md:text-4xl font-bold pr-40">{session.title}</h1>
      
      {/* 参加ボタン */}
      {currentUser && !session.isFinished && (
        <div className="mt-6">
          <SessionJoinButton sessionId={session.id} isParticipant={isParticipant} />
        </div>
      )}
    </header>
  );
}