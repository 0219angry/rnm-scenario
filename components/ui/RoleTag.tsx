import { ParticipantRole } from "@prisma/client";

// 各役割に対応するスタイルを定義
const roleStyles: Record<ParticipantRole, string> = {
  GM: "bg-red-100 text-red-800 border-red-300",
  KP: "bg-purple-100 text-purple-800 border-purple-300",
  PL: "bg-blue-100 text-blue-800 border-blue-300",
  PC: "bg-sky-100 text-sky-800 border-sky-300",
  SPECTATOR: "bg-gray-100 text-gray-800 border-gray-300",
  UNDECIDED: "bg-yellow-100 text-yellow-800 border-yellow-300",
};

type Props = {
  role: ParticipantRole | null;
};

export function RoleTag({ role }: Props) {
  // 役割がない場合は何も表示しない
  if (!role) {
    return null;
  }

  const style = roleStyles[role] || roleStyles.SPECTATOR; // 未定義の役割はデフォルトスタイルに

  return (
    <span
      className={`ml-2 inline-block rounded-md border px-2 py-0.5 text-xs font-semibold ${style}`}
    >
      {role}
    </span>
  );
}