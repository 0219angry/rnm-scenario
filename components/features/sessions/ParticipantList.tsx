import { AddParticipantForm } from './AddParticipantForm';
import { ParticipantRow } from './ParticipantRow';
import { Prisma, User } from '@prisma/client';

// 型定義をより具体的に
type ParticipantWithUser = Prisma.SessionParticipantGetPayload<{
  include: { user: true };
}>;

type ParticipantListProps = {
  participants: ParticipantWithUser[];
  isOwner: boolean;
  isFinished: boolean;
  sessionId: string;
  currentUser: User | null;
};

export function ParticipantList({ participants, isOwner, isFinished, sessionId, currentUser }: ParticipantListProps) {
  return (
    <section>
      <h2 className="font-semibold text-xl mb-4">👥 参加者 ({participants.length}人)</h2>
      {isOwner && !isFinished && <AddParticipantForm sessionId={sessionId} />}
      {participants.length > 0 ? (
        <ul className="space-y-3 mt-4">
          {participants.map((participant) => (
            <ParticipantRow 
              key={participant.user.id}
              sessionId={sessionId}
              participant={participant}
              isOwner={isOwner && !isFinished}
              currentUserId={currentUser?.id}
            />
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 mt-4">まだ参加者はいません。</p>
      )}
    </section>
  );
}