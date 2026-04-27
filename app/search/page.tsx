import { searchArticles } from '@/lib/content';
import ArticleCard from '@/components/ArticleCard';
import SearchBar from '@/components/SearchBar';
import { Suspense } from 'react';

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q || '';
  const results = query ? searchArticles(query) : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Search</h1>

      <div className="max-w-xl mb-10">
        <Suspense>
          <SearchBar placeholder="Search articles, topics, keywords..." />
        </Suspense>
      </div>

      {query && (
        <div className="mb-6 text-slate-500 text-sm">
          {results.length === 0
            ? `No results for "${query}"`
            : `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`}
        </div>
      )}

      {!query && (
        <div className="text-center py-16 text-slate-400">
          <div className="text-4xl mb-4">🔎</div>
          <div className="text-slate-600 font-medium">Type above to search</div>
          <div className="text-sm mt-1">Search by topic, keyword, or category</div>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {results.map(article => (
            <ArticleCard key={`${article.category}/${article.slug}`} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
