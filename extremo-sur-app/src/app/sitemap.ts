import type { MetadataRoute } from 'next'
import { ETAPAS } from '@/lib/etapas'

const BASE = 'https://extremo-sur.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const etapaUrls = ETAPAS.map(e => ({
    url:              `${BASE}/etapa/${e.slug}`,
    lastModified:     new Date(),
    changeFrequency:  'weekly' as const,
    priority:         0.8,
  }))

  return [
    {
      url:             BASE,
      lastModified:    new Date(),
      changeFrequency: 'weekly' as const,
      priority:        1.0,
    },
    {
      url:             `${BASE}/inscripcion`,
      lastModified:    new Date(),
      changeFrequency: 'monthly' as const,
      priority:        0.9,
    },
    {
      url:             `${BASE}/inscriptos`,
      lastModified:    new Date(),
      changeFrequency: 'daily' as const,
      priority:        0.7,
    },
    ...etapaUrls,
  ]
}
