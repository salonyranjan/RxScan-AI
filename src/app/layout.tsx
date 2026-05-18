// src/app/layout.tsx  ← Server Component
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  // Fallback title used by any page that doesn't define its own
  title: {
    default: "RxScan AI — Prescription Scanner & Drug Interaction Checker",
    template: "%s | SyncPharma",
  },
  description:
    "AI-powered prescription scanner. Upload a photo and instantly check drug interactions, dosages, and daily schedules — in plain English.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        {/* ── Preconnect to external resources for performance ── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* ── DNS prefetch for the API ── */}
        <link rel="dns-prefetch" href="https://api.anthropic.com" />

        {/* ── Preload the hero font ── */}
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}