import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/auth/'],
      },
    ],
    sitemap: 'https://extremo-sur.vercel.app/sitemap.xml',
  }
}
