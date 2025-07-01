"use client";

import { ParticipantRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useTransition, Fragment } from "react";
import Image from "next/image";
import Link from 'next/link';
import { Menu, Transition } from '@headlessui/react'; // Headless UIをインポート

// アイコン
import { EllipsisVerticalIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { FaYoutube, FaUserAlt } from "react-icons/fa";
import { RoleTag } from "@/components/ui/RoleTag";


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
    <li className="flex items-center gap-3 rounded-lg bg-slate-50 dark:bg-slate-700 p-3">
      
      {/* ユーザー情報（左側・プロフィールへのリンク） */}
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
          {/* 役割とキャラクター名を横並びに表示 */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {participant.role && <RoleTag role={participant.role} isCompact={true} />}
            {participant.character && (
              <span className="flex items-center gap-1"><FaUserAlt /> {participant.character}</span>
            )}
          </div>
        </div>
      </Link>

      {/* --- 操作エリア（右側） --- */}
      <div className="flex items-center gap-2 ml-auto">
        {/* YouTubeリンク */}
        {participant.youtubeLink && (
          <a href={participant.youtubeLink} target="_blank" rel="noopener noreferrer" title="視点動画" className="text-gray-400 hover:text-red-500">
            <FaYoutube size={24} />
          </a>
        )}

        {/* オーナー用の管理メニュー */}
        {isOwner && (
          <Menu as="div" className="relative">
            {/* メニューボタン (︙) */}
            <Menu.Button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
              <EllipsisVerticalIcon className="h-5 w-5" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              {/* メニュー項目 */}
              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                
                {/* --- 編集エリア --- */}
                {/* このdivは、常にMenu.Itemsの直接の子です */}
                <div className="p-1">
                  {isEditing ? (
                    // 【編集フォーム】
                    // このフォーム自体はMenu.Itemで囲まない
                    <div className="p-2 space-y-2">
                      <div>
                        <label className="text-xs font-medium">キャラクター名</label>
                        <input type="text" value={character} onChange={(e) => setCharacter(e.target.value)} className="w-full p-1 border rounded text-sm"/>
                      </div>
                      <div>
                        <label className="text-xs font-medium">役割</label>
                        <select value={selectedRole ?? ""} onChange={(e) => setSelectedRole(e.target.value as ParticipantRole || null)} className="w-full p-1 border rounded text-sm">
                          <option value="">役割なし</option>
                          {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <button onClick={handleCancelEdit} className="p-1 hover:bg-gray-100 rounded" title="キャンセル"><XMarkIcon className="h-5 w-5 text-gray-600"/></button>
                        <button onClick={handleUpdate} className="p-1 hover:bg-gray-100 rounded" title="保存"><CheckIcon className="h-5 w-5 text-green-600"/></button>
                      </div>
                    </div>
                  ) : (
                    // 【編集ボタン】
                    // ★★★ Menu.Itemで囲まず、ただのbuttonとして配置 ★★★
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900 hover:bg-gray-100"
                    >
                      <PencilIcon className="mr-2 h-5 w-5 text-gray-500" /> 編集
                    </button>
                  )}
                </div>

                {/* --- 削除エリア（アクションを実行して閉じる） --- */}
                <div className="p-1 border-t border-gray-100">
                  <Menu.Item>
                    {({ active }) => (
                      <button 
                        onClick={handleKick} 
                        disabled={isEditing} // 編集中は無効化
                        className={`${active ? 'bg-red-500 text-white' : 'text-red-600'} group flex w-full items-center rounded-md px-2 py-2 text-sm disabled:text-gray-400 disabled:bg-transparent`}
                      >
                        <TrashIcon className="mr-2 h-5 w-5" /> 削除する
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        )}
      </div>
    </li>
  );
}