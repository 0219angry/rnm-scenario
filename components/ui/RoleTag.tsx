import { ParticipantRole } from "@prisma/client";

type Props = {
  role: ParticipantRole;
  isCompact?: boolean;
};

// ★ 変更点1: Record<ParticipantRole, string>で型を付け、
//            UNDECIDEDのスタイルを追加する
const roleStyles: Record<ParticipantRole, string> = {
  GM: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  KP: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  PL: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  PC: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  SPECTATOR: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  UNDECIDED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", // 未定用のスタイル
};

export function RoleTag({ role, isCompact = false }: Props) {
  const sizeClasses = isCompact 
    ? "px-2 py-0.5 text-xs" 
    : "px-2.5 py-1 text-sm";

  return (
    <span
      className={`
        inline-block rounded-full font-semibold
        ${sizeClasses} 
        ${roleStyles[role]}
      `}
    >
      {/* ★ 変更点2: UNDECIDEDの場合の表示名を調整 */}
      {role === 'UNDECIDED' ? '未定' : role}
    </span>
  );
}