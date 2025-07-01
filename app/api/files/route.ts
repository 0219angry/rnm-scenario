import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service Role Keyを使った管理者権限のクライアント
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET_NAME = 'session-files'; // バケット名を定数化

// DELETEリクエストを処理するメインの関数
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { path, sessionId } = body;

    // --- 処理の分岐 ---
    if (path) {
      // 1. 単一ファイル削除の処理
      return await deleteSingleFile(path);
    } else if (sessionId) {
      // 2. セッション全体のファイル削除の処理
      return await deleteAllFilesFromSession(sessionId);
    } else {
      // どちらのパラメータも指定されていない場合はエラー
      return NextResponse.json(
        { message: '削除するには `path` または `sessionId` が必要です。' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('[API DELETE Error]', error);
    return NextResponse.json(
      { message: error.message || 'サーバー内部でエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// --- ヘルパー関数 ---

/**
 * 単一のファイルを削除する
 * @param path - 削除するファイルのフルパス (例: 'sessionId/fileName.pdf')
 */
async function deleteSingleFile(path: string) {
  const { error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    throw new Error(`単一ファイルの削除に失敗: ${error.message}`);
  }

  return NextResponse.json({ message: `ファイル「${path}」を削除しました。` });
}

/**
 * 指定されたセッションIDのフォルダ内にあるすべてのファイルを削除する
 * @param sessionId - 対象のセッションID
 */
async function deleteAllFilesFromSession(sessionId: string) {
  // フォルダ内のファイル一覧を取得
  const { data: fileList, error: listError } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .list(sessionId, { limit: 1000 });

  if (listError) {
    throw new Error(`ファイルリストの取得に失敗: ${listError.message}`);
  }

  if (!fileList || fileList.length === 0) {
    return NextResponse.json({ message: '削除対象のファイルが見つかりません。' });
  }

  // 削除するファイルのフルパスの配列を作成
  const filePaths = fileList.map(file => `${sessionId}/${file.name}`);

  // ファイルを一括で削除
  const { error: removeError } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .remove(filePaths);

  if (removeError) {
    throw new Error(`一括削除に失敗: ${removeError.message}`);
  }

  return NextResponse.json({
    message: `セッション「${sessionId}」から${filePaths.length}個のファイルを削除しました。`
  });
}