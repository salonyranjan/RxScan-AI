import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SyncPharma - Clinical Intelligence Platform",
  description: "Enterprise-grade medication adherence monitoring with AI-powered pharmaceutical interaction detection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning // 🌟 THE MAGIC FIX: Prevents extensions from crashing your server hydration
    >
      <body className={`${inter.variable} min-h-full bg-black text-white flex flex-col selection:bg-yellow-400 selection:text-black`}>
        {/* Main accessible wrapper ensuring full screen utilization */}
        <div className="flex-1 w-full flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}