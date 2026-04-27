import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import CategoryBadge from './CategoryBadge';
import type { Article } from '@/lib/content';

export default function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  const href = `/article/${article.category}/${article.slug}`;
  const dateStr = article.date ? format(parseISO(article.date), 'dd MMM yyyy') : '';

  if (featured) {
    return (
      <Link href={href} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-100">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <CategoryBadge category={article.category} size="md" asSpan />
            <span className="text-sm text-slate-400">{dateStr}</span>
            <span className="text-sm text-slate-400">·</span>
            <span className="text-sm text-slate-400">{article.readingTime} min read</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-tight mb-3">
            {article.title}
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">{article.summary}</p>
          <div className="mt-5 flex items-center gap-2 text-amber-600 font-semibold text-sm">
            <span>Read article</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-100">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <CategoryBadge category={article.category} asSpan />
          <span className="text-xs text-slate-400">{dateStr}</span>
        </div>
        <h3 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-snug mb-2">
          {article.title}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{article.summary}</p>
        <div className="mt-3 text-xs text-slate-400">{article.readingTime} min read</div>
      </div>
    </Link>
  );
}
