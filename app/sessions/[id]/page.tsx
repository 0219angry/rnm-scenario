import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { fetchCommentsBySessionId } from "@/lib/data";

// 新しく作成するコンポーネントをインポート
import { SessionHeader } from "@/components/features/sessions/SessionHeader";
import { SessionInfoCard } from "@/components/features/sessions/SessionInfoCard";
import { ScenarioInfoCard } from "@/components/features/sessions/ScenarioInfoCard";
import { ParticipantList } from "@/components/features/sessions/ParticipantList";
import { CommentSection } from "@/components/features/comments/CommentSection";
import { OwnerInfo } from "@/components/features/sessions/OwnerInfo";

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      scenario: { include: { rulebook: true } },
      owner: true,
      participants: {
        orderBy: { assignedAt: 'asc' },
        include: { user: true },
      },
    },
  });

  if (!session) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const comments = await fetchCommentsBySessionId(session.id);
  const isOwner = currentUser?.id === session.ownerId;
  const isParticipant = session.participants.some(p => p.userId === currentUser?.id);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 md:p-8 space-y-8">
        
        <SessionHeader 
          session={session} 
          isOwner={isOwner} 
          isParticipant={isParticipant}
          currentUser={currentUser}
        />

        <SessionInfoCard session={session} />

        <ScenarioInfoCard scenario={session.scenario} />
        
        <ParticipantList 
          participants={session.participants}
          isOwner={isOwner}
          isFinished={session.isFinished}
          sessionId={session.id}
          currentUser={currentUser}
        />

        <CommentSection 
          initialComments={comments} 
          sessionId={session.id}
          currentUser={currentUser}
        />

        <OwnerInfo owner={session.owner} />
      </div>
    </div>
  );
}