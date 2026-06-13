import type { Metadata } from 'next'

const BASE_URL = 'https://extremo-sur.vercel.app'

export const metadata: Metadata = {
  title: 'Galería de Fotos — Extremo Sur BJJ 2026',
  description: 'Fotos del Circuito Extremo Sur BJJ 2026 en Maldonado, Uruguay. Momentos de la 1° Etapa con más de 400 atletas compitiendo en Brazilian Jiu Jitsu.',
  keywords: [
    'fotos torneo jiu jitsu Uruguay',
    'galeria BJJ Maldonado',
    'imagenes competencia grappling',
    'Extremo Sur BJJ fotos',
    'fotos campeonato BJJ 2026',
  ],
  alternates: {
    canonical: `${BASE_URL}/fotos`,
  },
  openGraph: {
    title:       'Galería de Fotos — Extremo Sur BJJ 2026',
    description: 'Fotos de la 1° Etapa del Circuito Extremo Sur BJJ. +400 atletas compitiendo en Brazilian Jiu Jitsu en Maldonado, Uruguay.',
    url:         `${BASE_URL}/fotos`,
    siteName:    'Extremo Sur BJJ',
    images: [{ url: '/og-image.jpg', width: 1440, height: 960, alt: 'Galería Extremo Sur BJJ 2026' }],
    locale: 'es_UY',
    type:   'website',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Galería Extremo Sur BJJ 2026',
    description: 'Fotos de la 1° Etapa — +400 atletas en Maldonado.',
    images:      ['/og-image.jpg'],
  },
}

export default function FotosLayout({ children }: { children: React.ReactNode }) {
  return children
}
