import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "春联生成器 - 2026丙午马年",
  description: "AI生成个性化春联，将您的名字巧妙藏入对联之中",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* Google AdSense */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6838916324119792" crossOrigin="anonymous"></script>
      </head>
      <body className="antialiased min-h-screen bg-pattern" suppressHydrationWarning>{children}</body>
    </html>
  );
}
