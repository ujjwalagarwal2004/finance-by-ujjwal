import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import { CATEGORIES } from './categories';

export { CATEGORIES };

const contentDir = path.join(process.cwd(), 'content');

export interface Article {
  slug: string;
  category: string;
  title: string;
  summary: string;
  date: string;
  readingTime: number;
  tags: string[];
  content?: string;
}

function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / wordsPerMinute));
}

function getAllArticleFiles(): { filePath: string; category: string; slug: string }[] {
  const results: { filePath: string; category: string; slug: string }[] = [];
  for (const cat of CATEGORIES) {
    const catDir = path.join(contentDir, cat.slug);
    if (!fs.existsSync(catDir)) continue;
    const files = fs.readdirSync(catDir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      results.push({
        filePath: path.join(catDir, file),
        category: cat.slug,
        slug: file.replace(/\.md$/, ''),
      });
    }
  }
  return results;
}

export function getAllArticles(): Article[] {
  const files = getAllArticleFiles();
  const articles = files.map(({ filePath, category, slug }) => {
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(raw);
    return {
      slug,
      category,
      title: data.title || slug,
      summary: data.summary || '',
      date: data.date || '',
      readingTime: estimateReadingTime(content),
      tags: data.tags || [],
    };
  });
  return articles.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getArticlesByCategory(category: string): Article[] {
  return getAllArticles().filter(a => a.category === category);
}

export async function getArticle(category: string, slug: string): Promise<Article | null> {
  const filePath = path.join(contentDir, category, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  const processed = await remark().use(remarkGfm).use(remarkHtml, { sanitize: false }).process(content);
  return {
    slug,
    category,
    title: data.title || slug,
    summary: data.summary || '',
    date: data.date || '',
    readingTime: estimateReadingTime(content),
    tags: data.tags || [],
    content: processed.toString(),
  };
}

export function getCategoryMeta(slug: string) {
  return CATEGORIES.find(c => c.slug === slug);
}

export function searchArticles(query: string): Article[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return getAllArticles().filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.summary.toLowerCase().includes(q) ||
    a.tags.some(t => t.toLowerCase().includes(q)) ||
    a.category.toLowerCase().includes(q)
  );
}
