import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { AtletasClient } from './AtletasClient'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Competidores Inscriptos — Extremo Sur BJJ 2026',
  description: 'Lista de atletas inscriptos en el Circuito Extremo Sur BJJ 2026. Consultá tu inscripción, academia y categoría.',
  alternates: { canonical: 'https://extremo-sur.vercel.app/inscriptos' },
  openGraph: {
    title:       'Competidores Inscriptos — Extremo Sur BJJ 2026',
    description: 'Lista de atletas inscriptos en el torneo de Jiu Jitsu en Maldonado, Uruguay.',
    url:         'https://extremo-sur.vercel.app/inscriptos',
    siteName:    'Extremo Sur BJJ',
    images: [{ url: '/og-image.jpg', width: 1440, height: 960, alt: 'Inscriptos Extremo Sur BJJ 2026' }],
    locale: 'es_UY',
    type:   'website',
  },
}

export default async function InscriptosPage() {
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from('inscripciones')
    .select('id, nombre, academia, ciudad, faja, genero, division, categoria, peso_kg, estado')
    .order('nombre', { ascending: true })

  return <AtletasClient inscriptos={rows ?? []} />
}
