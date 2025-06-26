"use client";

import { useRouter } from "next/navigation";
import { User } from "@prisma/client";
import { useEffect, useState } from "react";

export default function ProfileEditPage() {
  const router = useRouter();
  const [user, setUser] = useState<Partial<User>>({});

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/user/me");
      const data = await res.json();
      setUser(data.user);
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      name: formData.get("name")?.toString(),
      username: formData.get("username")?.toString(),
      email: formData.get("email")?.toString(),
      image: formData.get("image")?.toString(),
    };
    const cleaned = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, value === "" ? undefined : value])
    );

    const res = await fetch("/api/user/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleaned),
    });

    if (res.ok) {
      const result = await res.json();
      const updatedUsername = result.user?.username ?? user.username;
      router.push("/" + updatedUsername);
      alert("プロフィールが更新されました！");
    } else {
      alert("保存に失敗しました。もう一度お試しください。");
    }
  };

  return (
    <main className="max-w-xl mx-auto mt-12 px-4">
      <h1 className="text-2xl font-bold mb-6">プロフィールを編集</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">名前</label>
          <input
            name="name"
            placeholder={user.name ?? ""}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">ユーザー名</label>
          <input
            name="username"
            placeholder={user.username ?? ""}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
          <input
            name="email"
            type="email"
            placeholder={user.email ?? ""}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">プロフィール画像URL</label>
          <input
            name="image"
            placeholder={user.image ?? ""}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-100"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            保存する
          </button>
        </div>
      </form>
    </main>
  );
}
