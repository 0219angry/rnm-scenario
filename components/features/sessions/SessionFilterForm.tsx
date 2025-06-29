"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

export function SessionFilterForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    router.push(pathname + "?" + createQueryString(name, value));
  };

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">絞り込み</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            セッション名
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className="bg-white dark:bg-gray-700 mt-1 block w-full pl-3 pr-2 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            onChange={handleChange}
            defaultValue={searchParams.get("title") || ""}
          />
        </div>
        <div>
          <label htmlFor="owner" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            主催者名
          </label>
          <input
            type="text"
            id="owner"
            name="owner"
            className="bg-white dark:bg-gray-700 mt-1 block w-full pl-3 pr-2 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            onChange={handleChange}
            defaultValue={searchParams.get("owner") || ""}
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            開催状態
          </label>
          <select
            id="status"
            name="status"
            className="bg-white dark:bg-gray-700 mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            onChange={handleChange}
            defaultValue={searchParams.get("status") || "upcoming"}
          >
            <option value="all">すべて</option>
            <option value="upcoming">これから</option>
            <option value="past">終了済み</option>
          </select>
        </div>
      </div>
    </div>
  );
}
