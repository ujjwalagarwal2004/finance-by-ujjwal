import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';

const colors: Record<string, string> = {
  'market-analysis': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  'india-finance': 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  'global-finance': 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  'investment-basics': 'bg-green-100 text-green-800 hover:bg-green-200',
  'explainers': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
};

export default function CategoryBadge({
  category,
  size = 'sm',
  asSpan = false,
}: {
  category: string;
  size?: 'sm' | 'md';
  asSpan?: boolean;
}) {
  const meta = CATEGORIES.find(c => c.slug === category);
  const label = meta?.label || category;
  const emoji = meta?.emoji || '📄';
  const colorClass = colors[category] || 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  const sizeClass = size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-0.5 text-xs';
  const className = `inline-flex items-center gap-1 rounded-full font-medium transition-colors ${colorClass} ${sizeClass}`;

  if (asSpan) {
    return (
      <span className={className}>
        <span>{emoji}</span>
        <span>{label}</span>
      </span>
    );
  }

  return (
    <Link href={`/${category}`} className={className}>
      <span>{emoji}</span>
      <span>{label}</span>
    </Link>
  );
}
