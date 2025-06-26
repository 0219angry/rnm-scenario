import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { UserMenu } from "./UserMenu";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-gray-800">
          RNM Scenario
        </Link>
        <div className="flex items-center">
          {user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <Link href="/signin" className="text-gray-800 hover:text-blue-500 mx-2">
                ログイン
              </Link>
              <Link href="/signup" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mx-2">
                新規登録
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}