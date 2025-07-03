import { ParticipantRole } from "@prisma/client";

export type Player = {
  id: string; // ユーザーID
  name: string; // プレイヤー名
  avatar_url: string | null; // アバター画像のURL
  role: ParticipantRole | null;
  character: string | null;
};

export type Trigger = {
  id: string; // トリガーのID (例: 'trigger-1')
  name: string; // トリガー名 (例: 'オープニング')
};