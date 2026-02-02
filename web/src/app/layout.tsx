import type { Metadata, Viewport } from "next";
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
      <body className="antialiased bg-red-900 min-h-screen" suppressHydrationWarning>{children}</body>
    </html>
  );
}
