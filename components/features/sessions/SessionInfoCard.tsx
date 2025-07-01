import { LocalDateTime } from '@/components/ui/LocalDateTime';
import { Session } from '@prisma/client';

export function SessionInfoCard({ session }: { session: Pick<Session, 'scheduledAt' | 'isFinished' | 'notes'> }) {
  return (
    <div className="space-y-4 text-lg">
      <p>
        <span className="font-semibold">📅 開催日:</span>{" "}
        <LocalDateTime 
          utcDate={session.scheduledAt} 
          formatStr="yyyy年MM月dd日 HH:mm" 
        />
      </p>
      <p>
        <span className="font-semibold">✅ 状態:</span>{" "}
        {session.isFinished ? "完了" : "未完了"}
      </p>
      {session.notes && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
          <h2 className="font-semibold text-xl mb-2">📝 メモ</h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-base">{session.notes}</p>
        </div>
      )}
    </div>
  );
}