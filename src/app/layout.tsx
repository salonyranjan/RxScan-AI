import type { Metadata } from "next";
import { Syne, DM_Mono, DM_Sans } from "next/font/google";
import "./globals.css"; // Ensure your global styles are imported here

// 1. Load fonts via next/font for automatic optimization (prevents CLS)
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

// 2. Define SEO Metadata for high Google ranking
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
        {/* Favicon handling: Next.js will automatically detect icon.svg or icon.png in this folder */}
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
