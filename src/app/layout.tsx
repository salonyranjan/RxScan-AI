import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "RxScan AI — Prescription Scanner & Drug Interaction Checker",
    template: "%s | RxScan AI",
  },
  description:
    "AI-powered prescription scanner. Upload a photo and instantly check drug interactions, dosages, and daily schedules — in plain English.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.anthropic.com" />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}