"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ParticipantRole } from "@prisma/client";
// ✅ heroiconsからアイコンをインポート
import { UserPlusIcon, UserMinusIcon, ChevronDownIcon } from "@heroicons/react/24/solid";

type Props = {
  sessionId: string;
  isParticipant: boolean;
};

// 選択可能な役割リスト
const ROLES: ParticipantRole[] = ["PL", "PC", "GM", "KP", "SPECTATOR", "UNDECIDED"];

export function SessionJoinButton({ sessionId, isParticipant }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isJoined, setIsJoined] = useState(isParticipant);
  const [selectedRole, setSelectedRole] = useState<ParticipantRole>("PL");

  const handleClick = async () => {
    // ... (API通信のロジックは変更なし)
    const apiUrl = `/api/sessions/${sessionId}/${isJoined ? "leave" : "join"}`;
    const method = isJoined ? "DELETE" : "POST";
    const fetchOptions: RequestInit = { method };

    if (method === "POST") {
      fetchOptions.headers = { "Content-Type": "application/json" };
      fetchOptions.body = JSON.stringify({ role: selectedRole });
    }

    try {
      const res = await fetch(apiUrl, fetchOptions);
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || "操作に失敗しました");
      }
      setIsJoined(!isJoined);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "エラーが発生しました");
    }
  };

  // ✅ 参加取り消しボタンのデザイン
  if (isJoined) {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 font-bold text-white rounded-lg transition bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
      >
        <UserMinusIcon className="h-5 w-5" />
        {isPending ? "処理中..." : "参加を取り消す"}
      </button>
    );
  }

  // ✅ 参加登録ボタンのデザイン
  return (
    <div className="flex flex-col md:flex-row items-stretch gap-2">
      {/* 役割選択ドロップダウン */}
      <div className="relative flex-shrink-0">
        <select
          id="role-select"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as ParticipantRole)}
          disabled={isPending}
          className="w-full h-full appearance-none rounded-lg border-2 border-gray-300 bg-white py-3 pl-4 pr-10 text-lg font-semibold text-gray-800 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />
      </div>

      {/* 参加実行ボタン */}
      <button
        onClick={handleClick}
        disabled={isPending}
        className="flex-grow flex items-center justify-center gap-2 py-3 px-4 font-bold text-white rounded-lg transition bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
      >
        <UserPlusIcon className="h-5 w-5" />
        {/* ✅ ボタンのテキストを選択した役割に応じて変更 */}
        {isPending ? "処理中..." : `${selectedRole}として参加する`}
      </button>
    </div>
  );
}