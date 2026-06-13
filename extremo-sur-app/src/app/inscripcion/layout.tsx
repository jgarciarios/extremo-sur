import type { Metadata } from 'next'

const BASE_URL = 'https://extremo-sur.vercel.app'

export const metadata: Metadata = {
  title: 'Inscripción — 2° Etapa Extremo Sur BJJ 2026',
  description: 'Inscribite a la 2° Etapa del Circuito Extremo Sur BJJ. Torneo de Brazilian Jiu Jitsu en Maldonado, Uruguay — 31 de Octubre 2026. Cupos limitados.',
  keywords: [
    'inscripcion torneo jiu jitsu Uruguay',
    'registro campeonato BJJ Maldonado',
    'inscribirse torneo grappling Uruguay',
    'Extremo Sur BJJ inscripcion',
    'torneo BJJ 31 octubre 2026',
  ],
  alternates: {
    canonical: `${BASE_URL}/inscripcion`,
  },
  openGraph: {
    title:       'Inscripción — 2° Etapa Extremo Sur BJJ 2026',
    description: 'Inscribite al torneo de Brazilian Jiu Jitsu en Maldonado, Uruguay. 31 de Octubre 2026. Gi y No-Gi. Cupos limitados.',
    url:         `${BASE_URL}/inscripcion`,
    siteName:    'Extremo Sur BJJ',
    images: [{ url: '/og-image.jpg', width: 1440, height: 960, alt: 'Inscripción Extremo Sur BJJ 2026' }],
    locale: 'es_UY',
    type:   'website',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Inscripción — Extremo Sur BJJ 2026',
    description: 'Inscribite al torneo de BJJ en Maldonado. 31 Oct 2026.',
    images:      ['/og-image.jpg'],
  },
}

// ─── FAQ Schema (boosts Rich Snippets en Google) ─────────────────────────────

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cómo me inscribo al torneo Extremo Sur BJJ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Completá el formulario de inscripción en esta página con tus datos personales, categoría de faja, división de peso y comprobante de pago. Los cupos son limitados.",
      },
    },
    {
      "@type": "Question",
      "name": "¿Cuáles son las categorías del torneo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El torneo Extremo Sur BJJ tiene categorías Kids (infantil), Juvenil, Adulto, Master (+30 años) y Absoluto. Compite en Gi (kimono) y No-Gi.",
      },
    },
    {
      "@type": "Question",
      "name": "¿Cuándo y dónde es la próxima fecha?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "La 2° Etapa del Circuito Extremo Sur 2026 es el 31 de Octubre de 2026 en el Campus de Maldonado, Uruguay. Apertura de portones: 08:30 hs.",
      },
    },
    {
      "@type": "Question",
      "name": "¿El torneo es solo para competidores de Uruguay?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. El torneo está abierto a atletas de cualquier país. En ediciones anteriores participaron competidores de Uruguay, Argentina, Brasil y otros países de la región.",
      },
    },
    {
      "@type": "Question",
      "name": "¿Qué necesito usar en la división No-Gi?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "En No-Gi es obligatorio usar camiseta elástica que cubra el torso y shorts de tejido negro. El color de la camiseta debe corresponder al color de tu faja o ser negro/blanco.",
      },
    },
  ],
}

export default function InscripcionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  )
}
