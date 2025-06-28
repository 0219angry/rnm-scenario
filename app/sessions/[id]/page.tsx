import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale/ja";
import { GenreTag } from "@/components/ui/GenreTag";
import Image from "next/image";
import { SessionJoinButton } from "@/components/features/sessions/SessionJoinButton";
import { ParticipantRow } from "@/components/features/sessions/ParticipantRow";
import { AddParticipantForm } from "@/components/features/sessions/AddParticipantForm";

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // ⭐️ includeに scenario: { include: { rulebook: true } } を追加してルールブック名も取得
  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      scenario: {
        include: {
          rulebook: true, // ルールブック情報も一緒に取得
        },
      },
      owner: true,
      participants: {
        orderBy: { assignedAt: 'asc' }, // 参加が早い順に並べる
        include: {
          user: true, // 参加者の詳細情報も取得
        },
      },
    },
  });

  if (!session) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const isOwner = currentUser?.id === session.ownerId;
  const isParticipant = session.participants.some(p => p.userId === currentUser?.id);
  const { scenario } = session; // 可読性のためにシナリオオブジェクトを分割代入

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 relative">
        {/* 編集ボタン */}
        {isOwner && (
          <Link
            href={`/sessions/${session.id}/edit`}
            className="absolute top-4 right-4 text-sm text-blue-500 hover:underline"
          >
            ✏️ 編集する
          </Link>
        )}

        <h1 className="text-3xl font-bold mb-6">{session.title}</h1>
        {currentUser && (
          <div className="my-6">
            <SessionJoinButton sessionId={session.id} isParticipant={isParticipant} />
          </div>
        )}
        {/* セッション情報 */}
        <div className="space-y-4 text-lg border-b pb-6 mb-6">
          <p>
            <span className="font-semibold">📅 開催日:</span>{" "}
            {format(new Date(session.scheduledAt), "yyyy年MM月dd日 HH:mm", {
              locale: ja,
            })}
          </p>
          <p>
            <span className="font-semibold">✅ 状態:</span>{" "}
            {session.isFinished ? "完了" : "未完了"}
          </p>
          {session.notes && (
             <div className="pt-4 border-t mt-4">
               <h2 className="font-semibold text-xl mb-2">📝 メモ</h2>
               <p className="text-gray-700 whitespace-pre-wrap text-base">{session.notes}</p>
             </div>
          )}
        </div>

        {/* ✅ シナリオ情報のセクション（情報を追加） */}
        <div className="mb-6">
          <h2 className="font-semibold text-xl mb-4">📘 シナリオ情報</h2>
          <div className="space-y-4 text-lg bg-slate-50 p-6 rounded-lg">
             <p><span className="font-semibold">タイトル:</span> {scenario.title}</p>
             <p className="flex items-center gap-2">
               <span className="font-semibold">ジャンル:</span> <GenreTag genre={scenario.genre} />
               {/* ルールブック名も表示 */}
               {scenario.rulebook && <span className="text-gray-500 text-base">/ {scenario.rulebook.name}</span>}
             </p>
             <p><span className="font-semibold">プレイヤー数:</span> {scenario.playerMin === scenario.playerMax ? scenario.playerMin : `${scenario.playerMin}〜${scenario.playerMax}`}人</p>
             {/* ✨ ここから追加情報 */}
             <p><span className="font-semibold">GM:</span> {scenario.requiresGM ? "必須" : "不要"}</p>
             <p><span className="font-semibold">所要時間:</span> {scenario.averageTime}分程度</p>
             {scenario.distribution && (
               <p><span className="font-semibold">配布先:</span> <a href={scenario.distribution} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{scenario.distribution}</a></p>
             )}
             {/* ✨ ここまで追加情報 */}
          </div>
        </div>
        
        {/* ✨ シナリオ内容のセクションを追加 */}
        {scenario.content && (
            <div className="mb-6">
                <h2 className="font-semibold text-xl mb-4">📄 シナリオの内容</h2>
                <div className="bg-slate-50 p-6 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{scenario.content}</p>
                </div>
            </div>
        )}
        
        {/* ✅【追加】参加者一覧セクション */}
        <div className="mb-6">
            <h2 className="font-semibold text-xl mb-4">👥 参加者 ({session.participants.length}人)</h2>
            {isOwner && <AddParticipantForm sessionId={session.id} />}
            {session.participants.length > 0 ? (
                <ul className="space-y-3">
                    {session.participants.map((participant) => (
                        // ✅ 新しいコンポーネントを呼び出す
                        <ParticipantRow 
                            key={participant.user.id}
                            sessionId={session.id}
                            participant={participant}
                            isOwner={isOwner}
                        />
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">まだ参加者はいません。</p>
            )}
        </div>

        {/* 登録者情報 */}
        <div className="text-sm text-gray-500 mt-8 pt-4 border-t flex items-center gap-2">
          <span className="font-semibold">作成者:</span>
          <Image
            width={32}
            height={32}
            src={session.owner.image ?? `https://avatar.vercel.sh/${session.owner.id}`}
            alt="User Icon"
            className="w-8 h-8 rounded-full"
          />
          <Link
            href={`/${session.owner.username ?? session.owner.id}`}
            className="text-blue-500 hover:underline"
          >
            {session.owner.name ?? session.owner.username}
          </Link>
        </div>
      </div>
    </div>
  );
}