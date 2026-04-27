import { notFound } from 'next/navigation';
import { getArticle, getAllArticles, getCategoryMeta } from '@/lib/content';
import CategoryBadge from '@/components/CategoryBadge';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map(a => ({ category: a.category, slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string; slug: string }> }): Promise<Metadata> {
  const { category, slug } = await params;
  const article = await getArticle(category, slug);
  if (!article) return {};
  return {
    title: `${article.title} — Finance by Ujjwal`,
    description: article.summary,
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;
  const article = await getArticle(category, slug);
  if (!article) notFound();

  const categoryMeta = getCategoryMeta(category);
  const dateStr = article.date ? format(parseISO(article.date), 'dd MMMM yyyy') : '';

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">
        <Link href="/" className="hover:text-slate-600 transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/${category}`} className="hover:text-slate-600 transition-colors">
          {categoryMeta?.label || category}
        </Link>
        <span>/</span>
        <span className="text-slate-600 truncate max-w-xs">{article.title}</span>
      </div>

      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <CategoryBadge category={category} size="md" />
          <span className="text-slate-400 text-sm">{dateStr}</span>
          <span className="text-slate-400 text-sm">·</span>
          <span className="text-slate-400 text-sm">{article.readingTime} min read</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-4">
          {article.title}
        </h1>
        <p className="text-xl text-slate-500 leading-relaxed">{article.summary}</p>
      </header>

      {/* Divider */}
      <div className="border-t border-slate-200 mb-10" />

      {/* Article body */}
      <article
        className="article-body"
        dangerouslySetInnerHTML={{ __html: article.content || '' }}
      />

      {/* Tags */}
      {article.tags.length > 0 && (
        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="text-sm text-slate-500 mb-3 font-medium">Tagged with:</div>
          <div className="flex flex-wrap gap-2">
            {article.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Back link */}
      <div className="mt-10">
        <Link
          href={`/${category}`}
          className="inline-flex items-center gap-2 text-amber-600 font-semibold hover:text-amber-800 transition-colors"
        >
          ← More {categoryMeta?.label || 'articles'}
        </Link>
      </div>
    </div>
  );
}
