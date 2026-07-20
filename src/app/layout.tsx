import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

import { getSystemSettings } from "@/features/ayarlar/actions";

export async function generateMetadata(): Promise<Metadata> {
  let faviconUrl = "/favicon.ico";

  try {
    const res = await getSystemSettings();
    if (res.success && res.data) {
      if (res.data.faviconUrl) faviconUrl = res.data.faviconUrl;
    }
  } catch (e) {
    console.error("Failed to fetch settings for metadata", e);
  }

  return {
    title: "GZL Tekstil",
    description: "GZL Tekstil Operasyon Yönetim Sistemi",
    icons: {
      icon: faviconUrl,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col text-neutral-800`}>
        {children}
      </body>
    </html>
  );
}
