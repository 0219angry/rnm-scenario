import Link from 'next/link';

const getTextColor = (hexColor: string) => {
  if (!hexColor) return 'black';
  const r = parseInt(hexColor.substring(1, 3), 16);
  const g = parseInt(hexColor.substring(3, 5), 16);
  const b = parseInt(hexColor.substring(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155 ? 'black' : 'white';
};


export const TagBadge = ({ name, color }: { name: string; color: string }) => (
  <Link href={`/tags/${name}`} className="block">
    <div className="rounded-full px-3 py-1 text-sm font-medium transition-transform hover:scale-105"
      style={{ backgroundColor: color, color: getTextColor(color) }}>
      {name}
    </div>
  </Link>
);