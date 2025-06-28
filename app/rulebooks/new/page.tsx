"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RulebookForm, RulebookFormValues } from "@/components/features/rulebooks/RulebookForm";

export default function NewRulebookPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: RulebookFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/rulebooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "登録に失敗しました");
      }
      
      alert("新しいルールブックを登録しました！");
      // 成功したら前のページに戻るか、特定のページに移動
      router.back(); 

    } catch (err) {
      setError(err instanceof Error ? err.message : "予期せぬエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto mt-12 max-w-2xl px-4">
      <div className="rounded-xl bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          新しいルールブックの登録
        </h1>
        {error && <p className="mb-4 text-center text-red-500">{error}</p>}
        <RulebookForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </main>
  );
}