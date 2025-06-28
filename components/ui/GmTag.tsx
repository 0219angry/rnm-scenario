import { ShieldCheckIcon, ShieldExclamationIcon } from '@heroicons/react/24/solid';

type Props = {
  requiresGM: boolean;
};

export function GmTag({ requiresGM }: Props) {
  const tagInfo = requiresGM
    ? {
        text: 'GM必須',
        icon: ShieldExclamationIcon,
        className: 'bg-orange-100 text-orange-800 border-orange-300',
      }
    : {
        text: 'GMレス',
        icon: ShieldCheckIcon,
        className: 'bg-green-100 text-green-800 border-green-300',
      };
      
  const Icon = tagInfo.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${tagInfo.className}`}
    >
      <Icon className="h-4 w-4" />
      {tagInfo.text}
    </span>
  );
}