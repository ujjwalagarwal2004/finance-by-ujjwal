import Link from 'next/link';
import { getAllArticles, CATEGORIES } from '@/lib/content';
import ArticleCard from '@/components/ArticleCard';
import SearchBar from '@/components/SearchBar';
import { Suspense } from 'react';

export default function Home() {
  const articles = getAllArticles();
  const featured = articles[0];
  const recent = articles.slice(1, 7);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
          Finance, <span className="text-amber-500">simplified.</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-xl mx-auto mb-6">
          Original research and analysis on markets, the Indian economy, and global finance — written in plain English, so you actually understand it.
        </p>
        <div className="max-w-lg mx-auto">
          <Suspense>
            <SearchBar placeholder="Search topics, keywords..." />
          </Suspense>
        </div>
      </div>

      {/* Featured article */}
      {featured && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-0.5 bg-amber-400 rounded" />
            <span className="text-sm font-semibold text-amber-600 uppercase tracking-wide">Latest</span>
          </div>
          <ArticleCard article={featured} featured />
        </div>
      )}

      {/* Recent articles grid */}
      {recent.length > 0 && (
        <div className="mb-14">
          <h2 className="text-xl font-bold text-slate-900 mb-5">Recent Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.map(article => (
              <ArticleCard key={`${article.category}/${article.slug}`} article={article} />
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-5">Browse by Topic</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map(cat => {
            const count = articles.filter(a => a.category === cat.slug).length;
            return (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="group bg-white border border-slate-100 rounded-xl p-5 hover:shadow-md hover:border-amber-200 transition-all"
              >
                <div className="text-2xl mb-2">{cat.emoji}</div>
                <div className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors mb-1">
                  {cat.label}
                </div>
                <div className="text-slate-500 text-sm mb-2 leading-snug">{cat.description}</div>
                <div className="text-xs text-slate-400">{count} article{count !== 1 ? 's' : ''}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
