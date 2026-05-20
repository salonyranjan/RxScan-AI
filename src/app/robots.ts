import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Use your production URL
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://rx-scan-ai.vercel.app';

  return {
    rules: {
      userAgent: '*', // Applies to all search engine bots (Google, Bing, etc.)
      allow: '/',     // Allows crawling of the entire site
      disallow: [
        '/api/',      // Never crawl your API routes
        '/private/',  // If you ever add admin or user-private dashboards
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`, // Point bots to the sitemap we just created
  };
}
