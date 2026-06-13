import type { Metadata } from 'next'
import Link from 'next/link'

const BASE_URL = 'https://extremo-sur.vercel.app'

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Categorías',
  description: 'Categorías del Torneo Extremo Sur BJJ 2026. Kids, Juvenil, Adulto, Master y Absoluto. Gi y No-Gi. Divisiones por faja y peso para competidores de Uruguay y la región.',
  keywords: [
    'categorías torneo jiu jitsu Uruguay',
    'divisiones BJJ Maldonado',
    'categorias torneo grappling',
    'fajas torneo jiu jitsu',
    'reglamento vestimenta no-gi BJJ',
    'kids juvenil adulto master absoluto BJJ',
    'peso categorias jiu jitsu',
  ],
  alternates: { canonical: `${BASE_URL}/categorias` },
  openGraph: {
    title: 'Categorías — Extremo Sur BJJ 2026',
    description: 'Kids, Juvenil, Adulto, Master y Absoluto. Gi y No-Gi. Consultá tu división antes de inscribirte.',
    url: `${BASE_URL}/categorias`,
    siteName: 'Extremo Sur BJJ',
    images: [{ url: '/og-image.jpg', width: 1440, height: 960, alt: 'Categorías Extremo Sur BJJ 2026' }],
    locale: 'es_UY',
    type: 'website',
  },
}

// ─── FAQ Schema ───────────────────────────────────────────────────────────────

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántas categorías tiene el torneo Extremo Sur BJJ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El torneo tiene cinco categorías principales: Kids (infantil), Juvenil, Adulto, Master (+30 años) y Absoluto (sin límite de peso). Cada una se divide en modalidad Gi (con kimono) y No-Gi (sin kimono).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las fajas que compiten en el torneo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Compiten todas las graduaciones: faja blanca, azul, morada, marrón y negra. Cada faja tiene sus propias divisiones de peso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué necesito usar en la modalidad No-Gi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En No-Gi es obligatorio usar camiseta elástica que cubra el torso y shorts de tejido negro. El color de la camiseta debe corresponder al color de tu faja o ser negro/blanco. No se permite ropa con bolsillos ni cremalleras.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo competir en el Absoluto además de mi categoría de peso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. El Absoluto es una división adicional abierta a todos los competidores de la misma faja, sin importar el peso. Podés inscribirte en tu categoría de peso y también en el Absoluto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Desde qué edad pueden competir los niños?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La categoría Kids está disponible desde los 4 años. Las divisiones infantiles están organizadas por rangos de edad y peso para garantizar competencias seguras y justas.',
      },
    },
  ],
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIAS = [
  {
    id: 'kids',
    roman: 'I',
    nombre: 'Kids',
    descripcion: 'Competidores infantiles desde los 4 años. Divisiones organizadas por rango de edad y peso. Ambiente seguro y controlado para los más jóvenes del BJJ.',
    edad: '4 – 15 años',
    gi: true,
    nogi: true,
    color: '#c9a227',
  },
  {
    id: 'juvenil',
    roman: 'II',
    nombre: 'Juvenil',
    descripcion: 'División para competidores jóvenes en transición hacia la categoría adulto. Todas las fajas. Gi y No-Gi.',
    edad: '16 – 17 años',
    gi: true,
    nogi: true,
    color: '#2a6bc2',
  },
  {
    id: 'adulto',
    roman: 'III',
    nombre: 'Adulto',
    descripcion: 'La categoría principal del torneo. Todas las fajas, todos los pesos. Gi y No-Gi. La mayor densidad de competidores del circuito.',
    edad: '18 – 29 años',
    gi: true,
    nogi: true,
    color: '#c9a227',
  },
  {
    id: 'master',
    roman: 'IV',
    nombre: 'Master',
    descripcion: 'Para competidores con experiencia de vida y de tatami. División Master 1 y Master 2 según edad. Todas las fajas.',
    edad: '+30 años',
    gi: true,
    nogi: true,
    color: '#2a6bc2',
  },
  {
    id: 'absoluto',
    roman: 'V',
    nombre: 'Absoluto',
    descripcion: 'Sin límite de peso. Abierto a todos los competidores de la misma faja. Es una inscripción adicional a la categoría de peso.',
    edad: 'Todas las edades',
    gi: true,
    nogi: true,
    color: '#c9a227',
  },
]

const FAJAS = [
  { nombre: 'Blanca',  color: '#e2e8f0', desc: 'Principiantes. Sin requisito de tiempo mínimo.' },
  { nombre: 'Azul',    color: '#3b82f6', desc: 'Grapplers con base técnica consolidada.' },
  { nombre: 'Morada',  color: '#a855f7', desc: 'Nivel intermedio-avanzado.' },
  { nombre: 'Marrón',  color: '#b45309', desc: 'Alto nivel técnico y competitivo.' },
  { nombre: 'Negra',   color: '#94a3b8', desc: 'Elite. La máxima graduación del BJJ.' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CategoriasPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <main style={{ background: 'var(--black)', color: 'var(--white)', minHeight: '100vh', fontFamily: 'var(--font-barlow), sans-serif' }}>

        {/* ── NAV BACK ──────────────────────────────────────────────────────── */}
        <div style={{ padding: '24px 5%', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/" style={{ color: 'var(--gold)', fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '4px', textTransform: 'uppercase', textDecoration: 'none' }}>
            ← EXTREMO SUR BJJ
          </Link>
        </div>

        {/* ── HEADER ────────────────────────────────────────────────────────── */}
        <header style={{ padding: '80px 5% 60px', borderBottom: '1px solid rgba(201,162,39,0.2)', background: 'linear-gradient(180deg, #071428 0%, #050810 100%)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '6px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 20 }}>
              Circuito 2026
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 0.9, letterSpacing: 3, margin: '0 0 24px', color: 'var(--white)' }}>
              CATEGORÍAS
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--gray)', maxWidth: 600, lineHeight: 1.7, margin: '0 0 32px' }}>
              Kids · Juvenil · Adulto · Master · Absoluto. Gi y No-Gi. Todas las fajas. Consultá tu división antes de inscribirte.
            </p>
            <Link href="/inscripcion" style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
              color: '#050810',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '0.85rem',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              padding: '14px 32px',
              textDecoration: 'none',
            }}>
              INSCRIBITE AHORA
            </Link>
          </div>
        </header>

        {/* ── DIVISIONES ────────────────────────────────────────────────────── */}
        <section style={{ padding: '80px 5%' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '6px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>
              Grupos de edad
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: 2, margin: '0 0 48px', color: 'var(--white)' }}>
              DIVISIONES
            </h2>

            <div style={{ display: 'grid', gap: 16 }}>
              {CATEGORIAS.map(cat => (
                <div key={cat.id} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '28px 32px',
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr auto',
                  gap: '24px',
                  alignItems: 'center',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2.5rem',
                    color: cat.color,
                    lineHeight: 1,
                  }}>
                    {cat.roman}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: 2, color: 'var(--white)', marginBottom: 6 }}>
                      {cat.nombre.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--gray)', lineHeight: 1.6 }}>
                      {cat.descripcion}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', letterSpacing: '3px', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 8 }}>
                      Edad
                    </div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--white)', whiteSpace: 'nowrap' }}>
                      {cat.edad}
                    </div>
                    <div style={{ marginTop: 10, display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      {cat.gi   && <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-heading)', letterSpacing: '2px', padding: '3px 8px', border: '1px solid var(--gold)', color: 'var(--gold)' }}>GI</span>}
                      {cat.nogi && <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-heading)', letterSpacing: '2px', padding: '3px 8px', border: '1px solid var(--steel-blue)', color: 'var(--steel-blue)' }}>NO-GI</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAJAS ─────────────────────────────────────────────────────────── */}
        <section style={{ padding: '80px 5%', background: 'rgba(7,20,40,0.5)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '6px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>
              Graduaciones
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: 2, margin: '0 0 12px', color: 'var(--white)' }}>
              FAJAS
            </h2>
            <p style={{ color: 'var(--gray)', marginBottom: 40, maxWidth: 520, lineHeight: 1.7 }}>
              Compiten todas las graduaciones. Cada faja tiene sus propias divisiones de peso para garantizar competencias equilibradas.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
              {FAJAS.map(faja => (
                <div key={faja.nombre} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${faja.color}30`,
                  padding: '24px 20px',
                  textAlign: 'center',
                }}>
                  <div style={{
                    width: 48,
                    height: 10,
                    background: faja.color,
                    margin: '0 auto 16px',
                    borderRadius: 2,
                  }} />
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', letterSpacing: 2, color: 'var(--white)', marginBottom: 8 }}>
                    {faja.nombre.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray)', lineHeight: 1.5 }}>
                    {faja.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GI vs NO-GI ───────────────────────────────────────────────────── */}
        <section style={{ padding: '80px 5%' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '6px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>
              Modalidades
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: 2, margin: '0 0 40px', color: 'var(--white)' }}>
              GI Y NO-GI
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* GI */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,162,39,0.2)', padding: '36px 32px' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', letterSpacing: '4px', color: 'var(--gold)', marginBottom: 12 }}>
                  MODALIDAD
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', letterSpacing: 3, color: 'var(--gold)', margin: '0 0 20px' }}>
                  GI
                </h3>
                <p style={{ color: 'var(--gray)', lineHeight: 1.8, fontSize: '0.95rem' }}>
                  Se compite con kimono (gi). El kimono debe ser de color blanco, azul o negro. Las tiras del cinturón deben corresponder a la graduación actual del atleta.
                </p>
                <ul style={{ marginTop: 20, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Kimono blanco, azul o negro', 'Cinturón de graduación correspondiente', 'Sin parches sueltos ni rotos'].map(item => (
                    <li key={item} style={{ fontSize: '0.85rem', color: 'var(--gray)', paddingLeft: 16, position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0, color: 'var(--gold)' }}>·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* NO-GI */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(42,107,194,0.3)', padding: '36px 32px' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', letterSpacing: '4px', color: 'var(--steel-blue)', marginBottom: 12 }}>
                  MODALIDAD
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', letterSpacing: 3, color: 'var(--steel-blue)', margin: '0 0 20px' }}>
                  NO-GI
                </h3>
                <p style={{ color: 'var(--gray)', lineHeight: 1.8, fontSize: '0.95rem' }}>
                  Se compite sin kimono. El color de la camiseta debe coincidir con el color de la faja del atleta, o ser negro o blanco.
                </p>
                <ul style={{ marginTop: 20, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    'Camiseta elástica que cubra el torso',
                    'Shorts de tejido negro (sin bolsillos ni cremalleras)',
                    'Color de camiseta = color de faja, negro o blanco',
                  ].map(item => (
                    <li key={item} style={{ fontSize: '0.85rem', color: 'var(--gray)', paddingLeft: 16, position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0, color: 'var(--steel-blue)' }}>·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────────── */}
        <section style={{ padding: '80px 5%', background: 'rgba(7,20,40,0.5)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '6px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>
              Dudas frecuentes
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: 2, margin: '0 0 48px', color: 'var(--white)' }}>
              PREGUNTAS
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {faqJsonLd.mainEntity.map((faq) => (
                <details key={faq.name} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  padding: '0',
                  cursor: 'pointer',
                }}>
                  <summary style={{
                    padding: '20px 28px',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    letterSpacing: '1px',
                    color: 'var(--white)',
                    listStyle: 'none',
                    cursor: 'pointer',
                  }}>
                    {faq.name}
                  </summary>
                  <div style={{ padding: '0 28px 20px', color: 'var(--gray)', lineHeight: 1.7, fontSize: '0.9rem' }}>
                    {faq.acceptedAnswer.text}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <section style={{ padding: '100px 5%', textAlign: 'center', background: 'linear-gradient(180deg, #050810 0%, #071428 100%)', borderTop: '1px solid rgba(201,162,39,0.2)' }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '6px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 20 }}>
              2° Etapa — 31 de Octubre 2026
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: 0.9, letterSpacing: 3, margin: '0 0 24px', color: 'var(--white)' }}>
              ¿LISTO PARA<br />COMPETIR?
            </h2>
            <p style={{ color: 'var(--gray)', lineHeight: 1.7, marginBottom: 40 }}>
              Cupos limitados. Completá el formulario con tus datos, categoría y academia.
            </p>
            <Link href="/inscripcion" style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
              color: '#050810',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '0.9rem',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              padding: '18px 48px',
              textDecoration: 'none',
              marginBottom: 16,
            }}>
              COMPLETAR INSCRIPCIÓN
            </Link>
            <div style={{ marginTop: 16 }}>
              <Link href="/inscriptos" style={{ color: 'var(--gray)', fontSize: '0.85rem', textDecoration: 'underline' }}>
                Ver lista de inscriptos →
              </Link>
            </div>
          </div>
        </section>

      </main>
    </>
  )
}
