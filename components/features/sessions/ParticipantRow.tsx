"use client";

import { ParticipantRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Image from "next/image";
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { RoleTag } from "@/components/ui/RoleTag";

// 親コンポーネントから受け取るデータの型
type Participant = {
  assignedAt: Date;
  role: ParticipantRole | null;
  user: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
};

type Props = {
  sessionId: string;
  participant: Participant;
  isOwner: boolean;
};

const ROLES: ParticipantRole[] = ["PL", "PC", "GM", "KP", "SPECTATOR"];

export function ParticipantRow({ sessionId, participant, isOwner }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ParticipantRole | null>(participant.role);

  // 役割の更新処理
  const handleUpdateRole = async () => {
    const roleToSend = selectedRole;

    try {
      await fetch(`/api/sessions/${sessionId}/participants/${participant.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: roleToSend }),
      });
      setIsEditing(false);
      startTransition(() => router.refresh());
    } catch (error) {
      console.error(error);
      alert("役割の更新に失敗しました");
    }
  };

  // キック処理
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
      console.error(error);
      alert("参加者の削除に失敗しました");
    }
  };

  const { user } = participant;

  return (
    <li className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
      <Image
        width={40} height={40}
        src={user.image ?? `https://avatar.vercel.sh/${user.id}`}
        alt={user.name ?? "User avatar"}
        className="h-10 w-10 rounded-full object-cover"
      />
      <div className="flex-grow">
        <span className="font-medium">{user.name ?? user.username}</span>
        {!isEditing && participant.role && (
          <RoleTag role={participant.role} />
        )}
        {isEditing && (
            <select
                value={selectedRole ?? ""}
                onChange={(e) => {
                    const value = e.target.value;
                    setSelectedRole(value === "" ? null : (value as ParticipantRole));
                }}
                className="ml-2 p-1 border rounded-md text-sm"
            >
                <option value="">役割なし</option>
                {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
            </select>
        )}
      </div>

      {/* オーナー用の管理ボタン */}
      {isOwner && (
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button onClick={handleUpdateRole} disabled={isPending} className="p-2 text-green-600 hover:text-green-800 disabled:text-gray-300"><CheckIcon className="h-5 w-5" /></button>
              <button onClick={() => setIsEditing(false)} disabled={isPending} className="p-2 text-red-600 hover:text-red-800 disabled:text-gray-300"><XMarkIcon className="h-5 w-5" /></button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} disabled={isPending} className="p-2 text-gray-500 hover:text-blue-600 disabled:text-gray-300"><PencilIcon className="h-5 w-5" /></button>
              <button onClick={handleKick} disabled={isPending} className="p-2 text-gray-500 hover:text-red-600 disabled:text-gray-300"><TrashIcon className="h-5 w-5" /></button>
            </>
          )}
        </div>
      )}
    </li>
  );
}