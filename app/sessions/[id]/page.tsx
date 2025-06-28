import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ja } from "date-fns/locale/ja";


export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      scenario: true,
      owner: true,
    },
  });

  if (!session) return notFound();

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{session.title}</h1>

      <div className="text-sm text-gray-600">
        📅 開催日：{format(new Date(session.scheduledAt), "yyyy年MM月dd日 HH:mm", { locale: ja })}
      </div>

      <div className="text-sm text-gray-600">
        ✅ 状態：{session.isFinished ? "完了" : "未完了"}
      </div>

      <div className="text-sm text-gray-600">
        📝 メモ：{session.notes || "（なし）"}
      </div>

      <div className="border-t pt-4">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">📘 シナリオ情報</h2>
        <p>タイトル：{session.scenario.title}</p>
        <p>ジャンル：{session.scenario.genre}</p>
        <p>人数：{session.scenario.playerMin}〜{session.scenario.playerMax}人</p>
      </div>

      <div className="border-t pt-4">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">👤 登録者</h2>
        <p>{session.owner.name ?? session.owner.username ?? "不明なユーザー"}</p>
      </div>
    </main>
  );
}