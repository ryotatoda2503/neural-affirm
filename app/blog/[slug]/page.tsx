import type { Metadata } from "next";
import Link from "next/link";
import { posts, getPost, getAllSlugs } from "../posts";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "記事が見つかりません" };

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `https://neural-affirm.com/blog/${post.slug}`,
      publishedTime: post.date,
      modifiedTime: post.updated || post.date,
      authors: ["Neural Affirm"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: `https://neural-affirm.com/blog/${post.slug}`,
    },
  };
}

function renderContent(content: string) {
  // Simple markdown-like rendering
  const paragraphs = content.split("\n\n");
  return paragraphs.map((p, i) => {
    // Bold text
    const parts = p.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={j} className="text-foreground font-medium">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={j}>{part}</span>;
    });

    // Check if it's a list item
    if (p.startsWith("- ")) {
      return (
        <li key={i} className="text-sm text-muted leading-relaxed ml-4 list-disc">
          {rendered}
        </li>
      );
    }

    return (
      <p key={i} className="text-sm text-muted leading-relaxed">
        {rendered}
      </p>
    );
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h1 className="text-2xl font-light mb-4">記事が見つかりません</h1>
        <Link href="/blog" className="text-sm text-muted hover:text-foreground">
          ← ブログ一覧に戻る
        </Link>
      </main>
    );
  }

  // Related posts (same category, excluding current)
  const related = posts
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    author: {
      "@type": "Organization",
      name: "Neural Affirm",
      url: "https://neural-affirm.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Neural Affirm",
      url: "https://neural-affirm.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://neural-affirm.com/blog/${post.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        {/* Breadcrumb */}
        <nav className="mb-10 animate-fade-in">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Link href="/" className="hover:text-foreground transition-colors">
              ホーム
            </Link>
            <span>/</span>
            <Link
              href="/blog"
              className="hover:text-foreground transition-colors"
            >
              ブログ
            </Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-[200px]">
              {post.title}
            </span>
          </div>
        </nav>

        {/* Article Header */}
        <header className="mb-12 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted">
              {post.category}
            </span>
            <span className="text-[10px] text-muted/50">{post.date}</span>
            <span className="text-[10px] text-muted/50">
              {post.readingTime}分で読める
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-light leading-relaxed tracking-wide">
            {post.title}
          </h1>
          <p className="text-sm text-muted mt-4 leading-relaxed">
            {post.description}
          </p>
        </header>

        {/* Table of Contents */}
        <nav className="mb-12 bg-card border border-border rounded-lg p-5">
          <h2 className="text-xs tracking-widest uppercase text-muted mb-3">
            目次
          </h2>
          <ol className="space-y-2">
            {post.sections.map((section, i) => (
              <li key={i}>
                <a
                  href={`#section-${i}`}
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  {i + 1}. {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Article Body */}
        <article>
          {post.sections.map((section, i) => (
            <section key={i} id={`section-${i}`} className="mb-12">
              <h2 className="text-xl font-medium mb-4 pt-4">{section.heading}</h2>
              <div className="space-y-4">{renderContent(section.content)}</div>
            </section>
          ))}
        </article>

        {/* CTA */}
        <div className="my-16 bg-gold/5 border border-gold/20 rounded-lg p-6 text-center">
          <h3 className="text-lg font-light mb-2">
            科学的アファメーションを今すぐ体験
          </h3>
          <p className="text-sm text-muted mb-4">
            全68項目のアファメーション・ブロッククリアリング・脳波誘導セッション
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-full bg-gold/10 text-gold border border-gold/30 text-sm hover:bg-gold/20 transition-all"
            >
              アファメーション辞書
            </Link>
            <Link
              href="/session"
              className="px-5 py-2.5 rounded-full border border-border text-sm text-muted hover:text-foreground transition-all"
            >
              セッション開始
            </Link>
          </div>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <section className="border-t border-border pt-10">
            <h3 className="text-xs tracking-widest uppercase text-muted mb-6">
              関連記事
            </h3>
            <div className="space-y-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="block border-l-2 border-border hover:border-gold/60 pl-5 py-3 transition-all group"
                >
                  <h4 className="text-sm font-medium group-hover:text-gold transition-colors">
                    {r.title}
                  </h4>
                  <p className="text-xs text-muted mt-1">{r.readingTime}分で読める</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-20 pt-8 border-t border-border text-center">
          <p className="text-xs text-muted/40 tracking-wider">
            Powered by Science · Built with Intention
          </p>
        </footer>
      </main>
    </>
  );
}
