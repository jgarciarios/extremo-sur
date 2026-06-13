import type { Metadata } from "next"
import { Barlow, Barlow_Condensed, Bebas_Neue } from "next/font/google"
import "./globals.css"
import { WhatsAppButton } from "@/components/WhatsAppButton"

// ─── Structured Data ──────────────────────────────────────────────────────────

const BASE_URL = "https://extremo-sur.vercel.app"

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      "name": "Extremo Sur BJJ",
      "url": BASE_URL,
      "logo": `${BASE_URL}/assets/img/logo.jpeg`,
      "sameAs": ["https://www.instagram.com/extremosurbjj/"],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": ["Spanish"],
      },
    },
    {
      "@type": "SportsEvent",
      "@id": `${BASE_URL}/#event-segunda-etapa`,
      "name": "Extremo Sur BJJ — 2° Etapa 2026",
      "description": "Segunda y última fecha del Circuito Extremo Sur 2026. Torneo de Brazilian Jiu Jitsu en Maldonado, Uruguay. Gi y No-Gi. Categorías Kids, Juvenil, Adulto, Master y Absoluto.",
      "sport": "Brazilian Jiu Jitsu",
      "startDate": "2026-10-31T08:30:00-03:00",
      "endDate": "2026-10-31T22:00:00-03:00",
      "url": `${BASE_URL}/etapa/segunda-etapa`,
      "image": `${BASE_URL}/og-image.jpg`,
      "organizer": { "@id": `${BASE_URL}/#organization` },
      "location": {
        "@type": "Place",
        "name": "Campus de Maldonado",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Maldonado",
          "addressRegion": "Maldonado",
          "addressCountry": "UY",
        },
      },
      "offers": {
        "@type": "Offer",
        "url": `${BASE_URL}/inscripcion`,
        "availability": "https://schema.org/InStock",
        "validFrom": "2026-06-01",
      },
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "inLanguage": "es",
    },
    {
      "@type": "SportsEvent",
      "@id": `${BASE_URL}/#event-primera-etapa`,
      "name": "Extremo Sur BJJ — 1° Etapa 2026",
      "description": "Primera fecha del Circuito Extremo Sur 2026. Más de 400 competidores en el Campus de Maldonado.",
      "sport": "Brazilian Jiu Jitsu",
      "startDate": "2026-05-30T08:30:00-03:00",
      "endDate": "2026-05-30T22:00:00-03:00",
      "url": `${BASE_URL}/etapa/primera-etapa`,
      "image": `${BASE_URL}/og-image.jpg`,
      "organizer": { "@id": `${BASE_URL}/#organization` },
      "location": {
        "@type": "Place",
        "name": "Campus de Maldonado",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Maldonado",
          "addressRegion": "Maldonado",
          "addressCountry": "UY",
        },
      },
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "previousStartDate": "2026-05-30",
      "inLanguage": "es",
    },
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      "url": BASE_URL,
      "name": "Extremo Sur BJJ",
      "description": "Circuito de Brazilian Jiu Jitsu en Maldonado, Uruguay",
      "publisher": { "@id": `${BASE_URL}/#organization` },
      "inLanguage": "es",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${BASE_URL}/inscriptos?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
}

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
})

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
})

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: ["400"],
})

export const metadata: Metadata = {
  title: {
    default:  "Extremo Sur BJJ 2026 — Torneo de Jiu Jitsu en Maldonado, Uruguay",
    template: "%s | Extremo Sur BJJ",
  },
  description: "Torneo oficial de Brazilian Jiu Jitsu en Maldonado, Uruguay. Circuito 2026: 2 etapas, +400 atletas, categorías Gi y No-Gi. Inscribite ahora.",
  metadataBase: new URL(BASE_URL),
  keywords: [
    "torneo jiu jitsu Uruguay",
    "campeonato BJJ Maldonado",
    "torneo grappling Uruguay",
    "competencia jiu jitsu brasileño",
    "Extremo Sur BJJ",
    "torneo BJJ 2026",
    "jiu jitsu Maldonado",
    "competencia BJJ Uruguay",
    "inscripcion torneo jiu jitsu",
    "circuito BJJ Uruguay",
  ],
  authors: [{ name: "Extremo Sur BJJ" }],
  creator: "Juan Ignacio García Ríos",
  publisher: "Extremo Sur BJJ",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title:       "Extremo Sur BJJ 2026 — Torneo de Jiu Jitsu en Maldonado",
    description: "Circuito 2026 de Brazilian Jiu Jitsu en Maldonado, Uruguay. 30 Mayo · 23 Agosto · 31 Octubre. +400 atletas, Gi y No-Gi.",
    url:         BASE_URL,
    siteName:    "Extremo Sur BJJ",
    images: [
      {
        url:    "/og-image.jpg",
        width:  1440,
        height: 960,
        alt:    "Extremo Sur BJJ 2026 — Torneo de Jiu Jitsu en Maldonado, Uruguay",
      },
    ],
    locale: "es_UY",
    type:   "website",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Extremo Sur BJJ 2026 — Torneo de Jiu Jitsu en Maldonado",
    description: "Circuito 2026 de Brazilian Jiu Jitsu en Maldonado, Uruguay. +400 atletas. Gi y No-Gi.",
    images:      ["/og-image.jpg"],
    site:        "@extremosurbjj",
  },
  verification: {
    google: "-4SFxSiQC3YRL68BlC55ntDfV4PuhAQDElyhoLEI_Lc",
  },
  alternates: {
    canonical: BASE_URL,
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${barlow.variable} ${barlowCondensed.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#050810] text-[#f0f4ff]" style={{ fontFamily: "var(--font-barlow), sans-serif" }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <WhatsAppButton />
      </body>
    </html>
  )
}
