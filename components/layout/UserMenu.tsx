"use client";

import { useState, useRef, useEffect } from "react";
import { logout } from "@/lib/auth";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";

export function UserMenu({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter(); 

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center focus:outline-none">
        <img
          src={user.image ?? `https://avatar.vercel.sh/${user.id}`}
          alt="User Icon"
          className="w-8 h-8 rounded-full"
        />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
          <button
            onClick={() => router.push("/"+user.username)}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            プロフィール
          </button>
          <button
            onClick={() => router.push("/user/settings")}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            設定
          </button>
          <form action={logout}>
            <button type="submit" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              ログアウト
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
