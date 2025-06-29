'use client';

// 使用するアイコンをインポート
import {
  FiFile,
  FiFileText,
  FiImage,
  FiDownload,
  FiMusic,
  FiVideo,
} from 'react-icons/fi';
import { FaFilePdf, FaFileWord, FaFileExcel } from 'react-icons/fa';
import { GoPackage } from 'react-icons/go';

// --- ヘルパー関数 (コンポーネントの外に定義) ---

// MIMEタイプに基づいてアイコンを返す関数
const getFileIcon = (mimetype: string) => {
  if (mimetype.startsWith('image/'))
    return <FiImage className="text-pink-500" />;
  if (mimetype.startsWith('video/'))
    return <FiVideo className="text-indigo-500" />;
  if (mimetype.startsWith('audio/'))
    return <FiMusic className="text-sky-500" />;
  if (mimetype === 'application/pdf')
    return <FaFilePdf className="text-red-600" />;
  if (mimetype.includes('word'))
    return <FaFileWord className="text-blue-600" />;
  if (mimetype.includes('spreadsheet') || mimetype.includes('excel'))
    return <FaFileExcel className="text-green-600" />;
  if (mimetype.startsWith('text/'))
    return <FiFileText className="text-gray-600" />;
  return <FiFile className="text-gray-500" />;
};

// ファイルサイズをフォーマットする関数
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// FileInfoの型定義をエクスポートして他で使えるようにする
export type FileInfo = {
  name: string;
  url: string;
  size: number;
  mimetype: string;
};

type Props = {
  files: FileInfo[];
  loading: boolean;
};

export function SessionFileList({ files, loading }: Props) {
  // 内部のuseEffectとデータ取得ロジックはすべて削除

  return (
    <div className="w-full">
      <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
        <GoPackage className="text-gray-600" />
        アップロード済ファイル一覧
      </h4>
      {loading ? (
        <div className="text-center p-4 text-gray-500">読み込み中...</div>
      ) : files.length === 0 ? (
        <div className="text-center p-4 text-gray-500 bg-gray-50 rounded-lg">
          ファイルが見つかりませんでした
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {files.map((file) => (
              <li
                key={file.name}
                className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="flex items-center min-w-0">
                  <div className="text-2xl mr-4 flex-shrink-0">
                    {getFileIcon(file.mimetype)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download // download属性で直接ダウンロードを促す
                  className="ml-4 p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors duration-150"
                  aria-label={`Download ${file.name}`}
                >
                  <FiDownload />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}