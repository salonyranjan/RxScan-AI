import type { Metadata } from "next";
import { Syne, DM_Mono, DM_Sans } from "next/font/google";
import "./globals.css";

// 1. Optimized font loading (prevents layout shifts and network blocking)
const syne = Syne({ 
  subsets: ["latin"], 
  weight: ["400", "500", "700", "800"], 
  variable: '--font-syne' 
});
const dmMono = DM_Mono({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500"], 
  variable: '--font-dm-mono' 
});
const dmSans = DM_Sans({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600"], 
  variable: '--font-dm-sans' 
});

// 2. SEO Metadata (Google Ranking)
export const metadata: Metadata = {
  title: {
    default: "RxScan AI — Clinical Prescription Scanner",
    template: "%s | RxScan AI",
  },
  description: "Upload your prescription image for instant medication extraction, NIH-backed drug interaction checks, and personalized daily schedules.",
  metadataBase: new URL("https://rx-scan-ai.vercel.app"),
  openGraph: {
    title: "RxScan AI — Clinical Prescription Safety",
    description: "Analyze your prescriptions with clinical precision using AI.",
    url: "https://rx-scan-ai.vercel.app",
    siteName: "RxScan AI",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${syne.variable} ${dmMono.variable} ${dmSans.variable}`}>
      <head>
        {/* Verification tag for Google Search Console */}
        <meta name="google-site-verification" content="f95427f5ed88e89c" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
