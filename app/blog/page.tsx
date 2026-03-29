import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "./posts";

export const metadata: Metadata = {
  title: "ブログ — アファメーションの科学的知識",
  description:
    "アファメーションの科学的根拠、実践方法、脳科学に基づくテクニックを解説するブログ。量子論・神経科学・心理学の最新知見をわかりやすく紹介します。",
  keywords: [
    "アファメーション ブログ",
    "アファメーション 科学",
    "アファメーション 脳科学",
    "潜在意識 書き換え",
  ],
  alternates: { canonical: "https://neural-affirm.com/blog" },
};

const categories = [...new Set(posts.map((p) => p.category))];

export default function BlogIndex() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16 md:py-24">
      <header className="mb-16 animate-fade-in">
        <Link
          href="/"
          className="text-xs text-muted hover:text-foreground transition-colors"
        >
          ← アファメーション辞書
        </Link>
        <h1 className="text-3xl md:text-4xl font-light tracking-wider mt-6 mb-3">
          Blog
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          アファメーションの科学的知識・実践ガイド
        </p>
      </header>

      {/* Category filter */}
      <div className="flex gap-2 mb-10 flex-wrap">
        {categories.map((cat) => (
          <span
            key={cat}
            className="px-3 py-1 rounded-full text-xs border border-border text-muted"
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Articles */}
      <div className="space-y-8">
        {posts.map((post) => (
          <article key={post.slug} className="group">
            <Link href={`/blog/${post.slug}`} className="block">
              <div className="border-l-2 border-border group-hover:border-gold/60 pl-6 py-4 transition-all duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted">
                    {post.category}
                  </span>
                  <span className="text-[10px] text-muted/50">
                    {post.date}
                  </span>
                  <span className="text-[10px] text-muted/50">
                    {post.readingTime}分で読める
                  </span>
                </div>
                <h2 className="text-lg font-medium leading-relaxed group-hover:text-gold transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-muted mt-2 leading-relaxed line-clamp-2">
                  {post.description}
                </p>
              </div>
            </Link>
          </article>
        ))}
      </div>

      <footer className="mt-20 pt-8 border-t border-border text-center">
        <p className="text-xs text-muted/40 tracking-wider">
          Powered by Science · Built with Intention
        </p>
      </footer>
    </main>
  );
}
