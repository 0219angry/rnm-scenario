"use client";

import { ParticipantRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Image from "next/image";
import Link from 'next/link';

// アイコンのインポート
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { FaYoutube, FaUserAlt } from "react-icons/fa";

// 関連コンポーネントのインポート
import { RoleTag } from "@/components/ui/RoleTag";
import { EditYoutubeLinkModal } from "@/components/features/sessions/EditYoutubeLinkModal";


// --- 型定義 ---

type Participant = {
  assignedAt: Date;
  role: ParticipantRole | null;
  user: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
  youtubeLink?: string | null;
  character?: string | null;
};

type Props = {
  sessionId: string;
  participant: Participant;
  isOwner: boolean;
  currentUserId?: string;
};

const ROLES: ParticipantRole[] = ["PL", "PC", "GM", "KP", "SPECTATOR"];


// --- コンポーネント本体 ---

export function ParticipantRow({ sessionId, participant, isOwner, currentUserId }: Props) {

  // --- フック定義 ---
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  
  const [selectedRole, setSelectedRole] = useState(participant.role);
  const [character, setCharacter] = useState(participant.character ?? "");

  const isSelf = currentUserId ? participant.user.id === currentUserId : false;

  // --- イベントハンドラ ---

  const handleUpdate = async () => {
    try {
      await fetch(`/api/sessions/${sessionId}/participants/${participant.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          role: selectedRole,
          character: character 
        }),
      });
      setIsEditing(false);
      startTransition(() => router.refresh());
    } catch (error) {
      console.error("更新エラー:", error);
      alert("更新に失敗しました");
    }
  };

  const handleKick = async () => {
    if (!window.confirm(`${participant.user.name ?? participant.user.username}さんをセッションから削除しますか？`)) {
      return;
    }
    try {
      await fetch(`/api/sessions/${sessionId}/participants/${participant.user.id}`, {
        method: "DELETE",
      });
      startTransition(() => router.refresh());
    } catch (error) {
      console.error("削除エラー:", error);
      alert("参加者の削除に失敗しました");
    }
  };
  
  // ★ 追加: 編集をキャンセルする処理
  const handleCancelEdit = () => {
    // stateを元のparticipantデータに戻す
    setSelectedRole(participant.role);
    setCharacter(participant.character ?? "");
    setIsEditing(false);
  };

  const { user } = participant;

  // --- レンダリング ---
  return (
    <li className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-lg bg-slate-50 dark:bg-slate-700 p-3 transition-colors">
      
      <Link href={`/${user.username ?? user.id}`} className="flex flex-grow items-center gap-3">
        <Image
          width={40} height={40}
          src={user.image ?? `https://avatar.vercel.sh/${user.id}`}
          alt={user.name ?? "User avatar"}
          className="h-10 w-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex flex-col items-start">
          <span className="font-medium">{user.name ?? user.username}</span>
          {!isEditing && participant.character && (
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <FaUserAlt />
              {participant.character}
            </span>
          )}
        </div>
      </Link>

      <div className="flex items-center gap-2 md:gap-4 ml-auto w-full sm:w-auto justify-end">
        {isEditing ? (
          <>
            <input type="text" value={character} onChange={(e) => setCharacter(e.target.value)} placeholder="キャラクター名" className="p-1 border rounded-md text-sm w-full bg-white dark:bg-gray-800" onClick={(e) => e.stopPropagation()} />
            <select value={selectedRole ?? ""} onChange={(e) => setSelectedRole(e.target.value as ParticipantRole || null)} onClick={(e) => e.stopPropagation()} className="p-1 border rounded-md text-sm bg-white dark:bg-gray-800">
              <option value="">役割なし</option>
              {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
            </select>
          </>
        ) : (
          participant.role && <RoleTag role={participant.role} />
        )}
        
        {participant.youtubeLink && (
          <a href={participant.youtubeLink} target="_blank" rel="noopener noreferrer" title={`${user.name}の視点動画`} className="transition-colors text-gray-400 hover:text-red-500 flex items-center" onClick={(e) => e.stopPropagation()}>
            <FaYoutube size={24} />
          </a>
        )}

        {isSelf && !isEditing && (
          <div onClick={(e) => e.stopPropagation()}>
            <EditYoutubeLinkModal sessionId={sessionId} currentLink={participant.youtubeLink ?? null} />
          </div>
        )}

        {isOwner && (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {isEditing ? (
              <>
                <button onClick={handleUpdate} disabled={isPending} className="p-2 text-green-600 hover:text-green-800 disabled:text-gray-300" title="保存"><CheckIcon className="h-5 w-5" /></button>
                <button onClick={handleCancelEdit} disabled={isPending} className="p-2 text-red-600 hover:text-red-800 disabled:text-gray-300" title="キャンセル"><XMarkIcon className="h-5 w-5" /></button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditing(true)} disabled={isPending} className="p-2 text-gray-500 hover:text-blue-600 disabled:text-gray-300" title="編集"><PencilIcon className="h-5 w-5" /></button>
                <button onClick={handleKick} disabled={isPending} className="p-2 text-gray-500 hover:text-red-600 disabled:text-gray-300" title="削除"><TrashIcon className="h-5 w-5" /></button>
              </>
            )}
          </div>
        )}
      </div>
    </li>
  );
}