import { MetadataRoute } from 'next';
// import prisma from '@/lib/db'; // Uncomment when fetching data from your database

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use your production URL or your local dev URL
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://rx-scan-ai.vercel.app';

  // ── 1. STATIC CORE ROUTES ───────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // ── 2. DYNAMIC ROUTES (Example) ────────────────────────────────────────────
  // When you have specific interaction pages in your database, 
  // you can fetch them here to boost your SEO.
  /* const interactions = await prisma.prescriptionScan.findMany({
    select: { id: true, scannedAt: true }
  });
  
  const dynamicRoutes = interactions.map((scan) => ({
    url: `${baseUrl}/scan/${scan.id}`,
    lastModified: scan.scannedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
  */

  return [...staticRoutes];
}
