import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin | Neural Affirm",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "ダッシュボード" },
  { href: "/admin/posts", label: "記事管理" },
  { href: "/admin/settings", label: "設定" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-sm font-medium tracking-wider">
            Neural Affirm <span className="text-muted text-xs ml-1">Admin</span>
          </Link>
          <nav className="flex gap-4">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="text-xs text-muted hover:text-foreground transition-colors"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <Link
          href="/"
          className="text-xs text-muted hover:text-foreground transition-colors"
        >
          サイトを見る →
        </Link>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
