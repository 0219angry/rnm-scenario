import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileEditForm } from "@/components/features/users/ProfileEditForm";

// このページはサーバーコンポーネント
export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    // ✅ mainコンテナのスタイルを調整
    <main className="container mx-auto mt-12 max-w-2xl px-4 mb-12">
      {/* ✅ カードデザインを適用したdivで全体を囲む */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100 border-b pb-4">
          プロフィールを編集
        </h1>
        <ProfileEditForm user={user} />
      </div>
    </main>
  );
}