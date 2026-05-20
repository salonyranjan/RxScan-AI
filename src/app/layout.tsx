import type { Metadata } from "next";
import { Syne, DM_Mono, DM_Sans } from "next/font/google";

const syne = Syne({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: '--font-syne' });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["300", "400", "500"], variable: '--font-dm-mono' });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300", "400", "500"], variable: '--font-dm-sans' });

export const metadata: Metadata = {
  title: {
    default: "RxScan AI — Clinical Prescription Scanner",
    template: "%s | RxScan AI",
  },
  description: "AI-powered prescription scanner. Upload a photo and instantly check drug interactions, dosages, and daily schedules.",
  openGraph: {
    title: "RxScan AI — Clinical Prescription Scanner",
    description: "Instantly check drug interactions using the NIH RxNav Database.",
    url: "https://yourdomain.com",
    siteName: "RxScan AI",
    images: [{ url: "https://yourdomain.com/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmMono.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
