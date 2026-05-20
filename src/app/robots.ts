import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Hardcoded production URL for simplicity
  const baseUrl = 'https://rx-scan-ai.vercel.app';

  return {
    rules: {
      userAgent: '*', 
      allow: '/',     
      disallow: [
        '/api/',      
        '/private/',  
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`, 
  };
}
