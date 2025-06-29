"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type FileInfo = {
  name: string;
  url: string;
};

type Props = {
  sessionId: string;
};

export default function GMFileManager({ sessionId }: Props) {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      const { data, error } = await supabase.storage
        .from("session-files")
        .list(sessionId);
      if (!error && data) {
        const infos = data.map((f) => ({
          name: f.name,
          url: supabase.storage
            .from("session-files")
            .getPublicUrl(`${sessionId}/${f.name}`).data.publicUrl,
        }));
        setFiles(infos);
      }
    };
    fetchFiles();
  }, [sessionId]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const { error } = await supabase.storage
      .from("session-files")
      .upload(`${sessionId}/${file.name}`, file);
    setUploading(false);
    if (error) {
      alert("アップロードに失敗しました");
      return;
    }
    setFile(null);
    const { data } = await supabase.storage
      .from("session-files")
      .list(sessionId);
    if (data) {
      const infos = data.map((f) => ({
        name: f.name,
        url: supabase.storage
          .from("session-files")
          .getPublicUrl(`${sessionId}/${f.name}`).data.publicUrl,
      }));
      setFiles(infos);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="rounded bg-blue-600 px-3 py-1 text-white disabled:bg-gray-400"
        >
          {uploading ? "アップロード中..." : "アップロード"}
        </button>
      </div>
      <ul className="space-y-1">
        {files.map((f) => (
          <li key={f.name} className="flex items-center justify-between">
            <a
              href={f.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {f.name}
            </a>
            {/* TODO: ファイルをユーザに割り当てるUIをここに追加 */}
          </li>
        ))}
        {files.length === 0 && (
          <li className="text-gray-500">ファイルはまだありません。</li>
        )}
      </ul>
    </div>
  );
}
