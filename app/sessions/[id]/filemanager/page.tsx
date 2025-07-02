import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Player } from '@/types/types';
import { FileInfo } from '@/components/features/sessions/SessionFileList';
import { FileManager } from '@/components/features/sessions/FileManager';
import { FileObject } from '@supabase/storage-js';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

// --- データ取得関数 ---

/**
 * セッションに参加しているプレイヤー一覧を取得する
 * @param sessionId セッションID
 * @returns プレイヤー情報の配列
 */
async function getPlayersForSession(sessionId: string): Promise<Player[]> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      participants: {
        orderBy: { assignedAt: 'asc' },
        include: {
          user: true,
        },
      },
    },
  });

  if (!session) {
    return [];
  }

  // Prismaから取得したデータを、コンポーネントが期待するPlayer[]形式に変換
  const players: Player[] = session.participants.map((participant) => ({
    id: participant.user.id,
    name: participant.user.name || '名無しさん',
    avatar_url: participant.user.image || null,
    role: participant.role,
    character: participant.character,
  }));

  return players;
}

/**
 * 指定されたセッションのアップロード済みファイル一覧を取得する
 * @param sessionId セッションID
 * @returns ファイル情報の配列
 */
async function getFilesForSession(sessionId: string): Promise<FileInfo[]> {
  try {
    const { data, error } = await supabase.storage
      .from('session-files')
      .list(sessionId);

    if (error || !data) {
      console.error('Error fetching files:', error?.message || 'Data is null');
      return [];
    }
    
    const files: FileInfo[] = data
      .filter((item) => item.id && item.name !== '.emptyFolderPlaceholder')
      .map((file: FileObject) => {
        const { data: publicUrlData } = supabase.storage
          .from('session-files')
          .getPublicUrl(`${sessionId}/${file.name}`);
        return {
          name: file.name,
          url: publicUrlData.publicUrl,
          size: file.metadata?.size ?? 0,
          mimetype: file.metadata?.mimetype ?? 'application/octet-stream',
        };
      });
    
    return files;
  } catch (err) {
    console.error('An unexpected error occurred in getFilesForSession:', err);
    return [];
  }
}


// --- ページコンポーネント本体 ---

export default async function SessionFilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

    // --- 1. ログイン中のユーザー情報を取得 ---
  const user = await getCurrentUser();

  // ログインしていない場合はログインページへ
  if (!user) {
    redirect('/signin');
  }

  // --- 2. このセッションでのユーザーの役割をデータベースで確認 ---
  const participant = await prisma.sessionParticipant.findUnique({
    where: {
      // 複合主キーを指定
      sessionId_userId: {
        sessionId: id,
        userId: user.id,
      },
    },
    select: {
      role: true, // 必要なのはロール情報のみ
    },
  });

  // --- 3. 権限チェック ---
  // 参加者でない、またはロールが'GM'でない場合はリダイレクト
  if (participant?.role !== 'GM' && participant?.role !== 'KP') {
    // 適切なエラーページやトップページにリダイレクト
    redirect(`/filemanager/authority?sessionId=${id}`); 
  }

  // サーバーサイドで必要なデータをすべて並行して取得
  const [players, files] = await Promise.all([
    getPlayersForSession(id),
    getFilesForSession(id),
  ]);

  return (
    <main className="p-2">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">セッションのファイル管理</h1>
        <p className="mt-1 text-gray-600">
          ファイルのアップロードと配布ルールの設定を行います。
        </p>
      </div>

      {/* クライアントラッパーコンポーネントを呼び出し、
        サーバーサイドで取得した初期データをpropsとして渡す
      */}
      <FileManager
        sessionId={id}
        initialPlayers={players}
        initialFiles={files}
      />
    </main>
  );
}