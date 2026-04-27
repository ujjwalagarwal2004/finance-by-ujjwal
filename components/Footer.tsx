import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="font-bold text-white text-lg mb-1">Finance by Ujjwal</div>
            <div className="text-amber-400 text-sm mb-3">Making finance simple</div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Clear, accurate, and original finance writing — for people who didn't study economics but still want to understand their money.
            </p>
          </div>
          <div>
            <div className="font-semibold text-white mb-3">Topics</div>
            <ul className="space-y-2">
              {CATEGORIES.map(cat => (
                <li key={cat.slug}>
                  <Link href={`/${cat.slug}`} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {cat.emoji} {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-semibold text-white mb-3">Disclaimer</div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Content here is for educational purposes only. Nothing on this site should be treated as financial advice. Always consult a registered financial advisor before making investment decisions.
            </p>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-10 pt-6 text-center text-sm text-slate-500">
          © {year} Finance by Ujjwal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
