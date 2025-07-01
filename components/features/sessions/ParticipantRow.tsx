"use client";

import { ParticipantRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useTransition, Fragment } from "react";
import Image from "next/image";
import Link from 'next/link';
import { Menu, Transition } from '@headlessui/react';

// アイコン
import { EllipsisVerticalIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { FaYoutube, FaUserAlt } from "react-icons/fa";
import { RoleTag } from "@/components/ui/RoleTag";
import { EditYoutubeLinkModal } from "./EditYoutubeLinkModal";


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
  
  // ★ 変更点: 編集用のstateのコメントアウトを解除
  const [selectedRole, setSelectedRole] = useState(participant.role);
  const [character, setCharacter] = useState(participant.character ?? "");

  const isSelf = currentUserId ? participant.user.id === currentUserId : false;

  // --- イベントハンドラ ---

  // ★ 変更点: 更新処理のコメントアウトを解除
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
  
  // ★ 変更点: キャンセル処理のコメントアウトを解除
  const handleCancelEdit = () => {
    setSelectedRole(participant.role);
    setCharacter(participant.character ?? "");
    setIsEditing(false);
  };

  const { user } = participant;

  // --- レンダリング ---
  return (
    <li className="flex items-center gap-3 rounded-lg bg-slate-50 dark:bg-slate-700 p-3">
      
      <Link href={`/${user.username ?? user.id}`} className="flex flex-grow items-center gap-3">
        <Image 
          width={40} 
          height={40} 
          src={user.image ?? `https://avatar.vercel.sh/${user.id}`} 
          alt={user.name ?? "avatar"}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="flex flex-col items-start">
          <span className="font-medium">{user.name ?? user.username}</span>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {participant.role && <RoleTag role={participant.role} isCompact={true} />}
            {participant.character && (
              <span className="flex items-center gap-1"><FaUserAlt /> {participant.character}</span>
            )}
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-2 ml-auto">
        {participant.youtubeLink && (
          <a href={participant.youtubeLink} target="_blank" rel="noopener noreferrer" title="視点動画" className="text-red-500">
            <FaYoutube size={24} />
          </a>
        )}

        {(isOwner || isSelf) && (
          <Menu as="div" className="relative">
            <Menu.Button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600" disabled={isPending}>
              <EllipsisVerticalIcon className="h-5 w-5" />
            </Menu.Button>
            <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                
                {isOwner && (
                  <div className="p-1">
                    {isEditing ? (
                      // ★ 変更点: 編集フォームのUIを実装
                      <div className="p-2 space-y-2" onClick={(e) => e.stopPropagation()}>
                        <div>
                          <label className="text-xs font-medium text-gray-600">キャラクター名</label>
                          <input type="text" value={character} onChange={(e) => setCharacter(e.target.value)} placeholder="キャラクター名" className="w-full p-1 border rounded text-sm"/>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600">役割</label>
                          <select value={selectedRole ?? ""} onChange={(e) => setSelectedRole(e.target.value as ParticipantRole || null)} className="w-full p-1 border rounded text-sm">
                            <option value="">役割なし</option>
                            {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                          </select>
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                          <button onClick={handleCancelEdit} disabled={isPending} className="p-1 hover:bg-gray-100 rounded" title="キャンセル"><XMarkIcon className="h-5 w-5 text-gray-600"/></button>
                          <button onClick={handleUpdate} disabled={isPending} className="p-1 hover:bg-gray-100 rounded" title="保存"><CheckIcon className="h-5 w-5 text-green-600"/></button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setIsEditing(true)} disabled={isPending} className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900 hover:bg-gray-100 disabled:text-gray-400">
                        <PencilIcon className="mr-2 h-5 w-5 text-gray-500" /> 編集
                      </button>
                    )}
                  </div>
                )}
                
                {isSelf && !isEditing && (
                   <div className="p-1" onClick={(e) => e.stopPropagation()}>
                     <EditYoutubeLinkModal sessionId={sessionId} currentLink={participant.youtubeLink ?? null} asMenuItem={true} />
                   </div>
                )}
                
                {isOwner && (
                  <div className="p-1 border-t border-gray-100">
                    <Menu.Item>
                      {({ active }) => (
                        <button onClick={handleKick} disabled={isPending || isEditing || isSelf} className={`${active ? 'bg-red-500 text-white' : 'text-red-600'} group flex w-full items-center rounded-md px-2 py-2 text-sm disabled:text-gray-400 disabled:bg-transparent`}>
                          <TrashIcon className="mr-2 h-5 w-5" /> 削除する
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                )}

              </Menu.Items>
            </Transition>
          </Menu>
        )}
      </div>
    </li>
  );
}