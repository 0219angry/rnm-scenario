"use client";

import { ParticipantRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Image from "next/image";

type SearchUser = {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
};

type Props = {
  sessionId: string;
};

const ROLES: ParticipantRole[] = ["PL", "PC", "GM", "KP", "SPECTATOR", "UNDECIDED"];

export function AddParticipantForm({ sessionId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [selectedRole, setSelectedRole] = useState<ParticipantRole>("PL");

  // ユーザー検索処理
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    const res = await fetch(`/api/users?search=${query}`);
    const users = await res.json();
    setSearchResults(users);
  };

  // ユーザー追加処理
  const handleAddUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: selectedRole }),
      });
      if (!res.ok) throw new Error("追加に失敗しました");

      // 成功したらフォームをリセットし、参加者一覧を更新
      setSearchQuery("");
      setSearchResults([]);
      startTransition(() => router.refresh());
    } catch (error) {
      console.error(error);
      alert("ユーザーの追加に失敗しました。");
    }
  };

  return (
    <div className="space-y-4 rounded-lg border bg-white dark:bg-gray-800 p-6">
      <h3 className="font-bold text-lg">参加者を追加</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="ユーザー名で検索..."
          className="md:col-span-2 w-full rounded-md border p-2"
        />
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as ParticipantRole)}
          className="w-full rounded-md border p-2 bg-white dark:bg-gray-700"
        >
          {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
        </select>
      </div>

      {searchResults.length > 0 && (
        <ul className="space-y-2 border-t pt-4">
          {searchResults.map((user) => (
            <li key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              <div className="flex items-center gap-3">
                <Image
                  width={40} height={40}
                  src={user.image ?? `https://avatar.vercel.sh/${user.id}`}
                  alt={user.name ?? "User avatar"}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-300">@{user.username}</p>
                </div>
              </div>
              <button
                onClick={() => handleAddUser(user.id)}
                disabled={isPending}
                className="rounded-md bg-blue-600 px-3 py-1 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
              >
                追加
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}