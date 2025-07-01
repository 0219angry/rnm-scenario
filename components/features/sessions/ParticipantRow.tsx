"use client";

import { ParticipantRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useTransition, Fragment } from "react";
import Image from "next/image";
import Link from 'next/link';
import { Menu, Transition } from '@headlessui/react'; // Headless UIをインポート
import { EditYoutubeLinkModal } from "./EditYoutubeLinkModal";

// アイコン
import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
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



// --- コンポーネント本体 ---

export function ParticipantRow({ sessionId, participant, isOwner, currentUserId }: Props) {

  // --- フック定義 ---
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  
  // const [selectedRole, setSelectedRole] = useState(participant.role);
  // const [character, setCharacter] = useState(participant.character ?? "");

  const isSelf = currentUserId ? participant.user.id === currentUserId : false;

  // --- イベントハンドラ ---

  // const handleUpdate = async () => {
  //   try {
  //     await fetch(`/api/sessions/${sessionId}/participants/${participant.user.id}`, {
  //       method: "PATCH",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ 
  //         role: selectedRole,
  //         character: character 
  //       }),
  //     });
  //     setIsEditing(false);
  //     startTransition(() => router.refresh());
  //   } catch (error) {
  //     console.error("更新エラー:", error);
  //     alert("更新に失敗しました");
  //   }
  // };

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
  // const handleCancelEdit = () => {
  //   // stateを元のparticipantデータに戻す
  //   setSelectedRole(participant.role);
  //   setCharacter(participant.character ?? "");
  //   setIsEditing(false);
  // };

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
          <a href={participant.youtubeLink} target="_blank" rel="noopener noreferrer" title="視点動画" className="text-red-500">
            <FaYoutube size={24} />
          </a>
        )}

        {isSelf && !isOwner && !isEditing && (
          <div onClick={(e) => e.stopPropagation()}>
            <EditYoutubeLinkModal sessionId={sessionId} currentLink={participant.youtubeLink ?? null} />
          </div>
        )}

        {/* ★ 変更点: isOwner または isSelf の場合にメニューを表示 */}
        {(isOwner || isSelf) && (
          <Menu as="div" className="relative">
            <Menu.Button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600" disabled={isPending}>
              <EllipsisVerticalIcon className="h-5 w-5" />
            </Menu.Button>
            <Transition as={Fragment} /* ... */ >
              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                
                {/* オーナー用の編集機能 */}
                {isOwner && (
                  <div className="p-1">
                    {isEditing ? (
                      <div className="p-2 space-y-2" onClick={(e) => e.stopPropagation()}>
                        {/* 編集フォーム... */}
                      </div>
                    ) : (
                      <button onClick={() => setIsEditing(true)} disabled={isPending} className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900 hover:bg-gray-100">
                        <PencilIcon className="mr-2 h-5 w-5 text-gray-500" /> 編集
                      </button>
                    )}
                  </div>
                )}

                {/* ★ 追加: 自分自身の場合にYouTubeリンク編集メニューを表示 */}
                {isSelf && !isEditing && (
                  <div className="p-1" onClick={(e) => e.stopPropagation()}>
                    {/* isMenuItem propを渡して表示を切り替える */}
                    <EditYoutubeLinkModal
                      sessionId={sessionId}
                      currentLink={participant.youtubeLink ?? null}
                      asMenuItem={true} 
                    />
                  </div>
                )}

                {/* オーナー用の削除機能 */}
                {isOwner && (
                  <div className="p-1 border-t border-gray-100">
                    <Menu.Item>
                      {({ active }) => (
                        <button 
                          onClick={handleKick} 
                          // ★ 変更点: 自分自身は削除できないように無効化
                          disabled={isPending || isEditing || isSelf} 
                          className={`${active ? 'bg-red-500 text-white' : 'text-red-600'} group flex w-full items-center rounded-md px-2 py-2 text-sm disabled:text-gray-400 disabled:bg-transparent`}
                        >
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