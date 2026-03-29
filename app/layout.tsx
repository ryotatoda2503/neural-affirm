import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Noto_Serif_JP } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { getSetting } from "../lib/settings-db";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const SITE_URL = "https://neural-affirm.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Neural Affirm — 科学的アファメーション辞書",
    template: "%s | Neural Affirm",
  },
  description:
    "量子論・脳科学・心理学に基づく科学的アファメーション辞書。朝と夜の全68項目、ブロック自動クリアリング、脳波誘導セッション機能付き。",
  keywords: [
    "アファメーション",
    "アファメーション 一覧",
    "アファメーション 効果",
    "アファメーション 科学的根拠",
    "アファメーション 脳科学",
    "朝のアファメーション",
    "夜のアファメーション",
    "アファメーション 潜在意識",
    "アファメーション お金",
    "バイノーラルビート アファメーション",
    "ニューラルインストール",
    "自動クリアリング",
    "科学的アファメーション辞書",
  ],
  authors: [{ name: "Neural Affirm" }],
  creator: "Neural Affirm",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: SITE_URL,
    siteName: "Neural Affirm",
    title: "Neural Affirm — 科学的アファメーション辞書",
    description:
      "量子論・脳科学・心理学に基づく科学的アファメーション辞書。全68項目の朝夜アファメーション、ブロック自動クリアリング、脳波誘導セッション。",
  },
  twitter: {
    card: "summary_large_image",
    title: "Neural Affirm — 科学的アファメーション辞書",
    description:
      "量子論・脳科学・心理学に基づく科学的アファメーション辞書。聴くだけで潜在意識を書き換えるニューラルインストール機能搭載。",
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read Google tags from DB
  let gaId = "";
  let gtmId = "";
  let gscVerification = "";
  try {
    gaId = getSetting("google_analytics_id");
    gtmId = getSetting("google_tag_manager_id");
    gscVerification = getSetting("google_search_console_verification");
  } catch {}

  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${notoSerifJP.variable} h-full antialiased`}
    >
      <head>
        {/* Google Search Console */}
        {gscVerification && (
          <meta
            name="google-site-verification"
            content={gscVerification}
          />
        )}

        {/* Google Analytics (GA4) */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-config" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        )}

        {/* Google Tag Manager */}
        {gtmId && (
          <Script id="gtm-script" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        )}
      </head>
      <body className="min-h-full flex flex-col">
        {/* GTM noscript */}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        {children}
      </body>
    </html>
  );
}
