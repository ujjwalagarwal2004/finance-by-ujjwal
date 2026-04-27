import { notFound } from 'next/navigation';
import { getArticlesByCategory, getCategoryMeta, CATEGORIES } from '@/lib/content';
import ArticleCard from '@/components/ArticleCard';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return CATEGORIES.map(cat => ({ category: cat.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const meta = getCategoryMeta(category);
  if (!meta) return {};
  return { title: `${meta.label} — Finance by Ujjwal`, description: meta.description };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const meta = getCategoryMeta(category);
  if (!meta) notFound();

  const articles = getArticlesByCategory(category);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-10">
        <div className="text-4xl mb-3">{meta.emoji}</div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{meta.label}</h1>
        <p className="text-slate-500 text-lg">{meta.description}</p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <div className="text-4xl mb-4">📝</div>
          <div className="font-semibold text-slate-600 mb-2">No articles yet</div>
          <div className="text-sm">Check back soon — new content is on the way.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map(article => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
