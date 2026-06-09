import { notFound, redirect } from 'next/navigation'
import { getEtapa, ETAPAS } from '@/lib/etapas'
import type { Metadata } from 'next'
import './etapa.css'
import { BracketsSection } from '@/components/BracketsSection'

// ─── Static params ────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return ETAPAS.map(e => ({ slug: e.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const etapa = getEtapa(slug)
  if (!etapa) return {}
  return {
    title:       `${etapa.titulo} — Extremo Sur BJJ 2026`,
    description: etapa.descripcion,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ESTADO_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  'proximo':    { label: 'PRÓXIMO',    color: '#22c55e', bg: 'rgba(34,197,94,0.1)'  },
  'en-curso':   { label: 'EN CURSO',   color: '#e8c14a', bg: 'rgba(232,193,74,0.1)' },
  'finalizado': { label: 'FINALIZADO', color: '#8a9ab5', bg: 'rgba(138,154,181,0.1)'},
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function EtapaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const etapa = getEtapa(slug)
  if (!etapa) redirect('/')

  const estado = ESTADO_LABEL[etapa.estado]

  // ── AJP: página informativa simple, sin inscripción ni brackets ──────────────
  if (etapa.esAJP) return (
    <main style={{ minHeight: '100vh', background: '#050810', color: '#f0f4ff', fontFamily: 'var(--font-barlow), sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}>
      <a href="/#fechas" style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#8a9ab5', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '48px', border: '1px solid rgba(138,154,181,0.2)', padding: '10px 20px', borderRadius: '2px' }}>
        ← VOLVER AL INICIO
      </a>
      <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '5px', textTransform: 'uppercase', color: '#c9a227', marginBottom: '12px' }}>
        Evento Internacional · 23 de Agosto 2026
      </div>
      <h1 style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: 'clamp(3rem, 10vw, 5.5rem)', letterSpacing: '6px', lineHeight: 0.9, margin: '0 0 24px' }}>
        AJP URUGUAY
      </h1>
      <div style={{ width: '48px', height: '2px', background: '#c9a227', margin: '0 auto 32px' }} />
      <p style={{ maxWidth: '520px', fontSize: '1.05rem', lineHeight: 1.7, color: '#8a9ab5', marginBottom: '16px' }}>
        El AJP Uruguay es un evento del circuito internacional <strong style={{ color: '#f0f4ff' }}>Abu Dhabi Jiu-Jitsu Pro</strong>, organizado de forma independiente a Extremo Sur.
      </p>
      <p style={{ maxWidth: '520px', fontSize: '1.05rem', lineHeight: 1.7, color: '#8a9ab5', marginBottom: '48px' }}>
        Atletas de la región participan en esta fecha como representantes de sus academias. Para inscripción y más información, visitá el sitio oficial del AJP.
      </p>
      <a
        href="https://ajptour.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'inline-block', background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.5)', color: '#c9a227', fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.85rem', fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', textDecoration: 'none', padding: '14px 36px', borderRadius: '2px' }}
      >
        IR AL SITIO OFICIAL DEL AJP →
      </a>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#050810', color: '#f0f4ff', fontFamily: 'var(--font-barlow), sans-serif' }}>

      {/* ── Header ── */}
      <div style={{
        background:    etapa.esAJP ? 'linear-gradient(180deg, #1a1200 0%, #050810 100%)' : 'linear-gradient(180deg, #071428 0%, #050810 100%)',
        borderBottom:  `1px solid ${etapa.esAJP ? 'rgba(201,162,39,0.3)' : 'rgba(42,107,194,0.2)'}`,
        padding:       '80px 24px 60px',
        textAlign:     'center',
      }}>
        <a href="/#fechas" className="etapa-back">
          ← VOLVER AL INICIO
        </a>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: estado.color, background: estado.bg, border: `1px solid ${estado.color}40`, padding: '4px 12px', borderRadius: '2px' }}>
            {estado.label}
          </span>
          {etapa.esAJP && (
            <span style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#c9a227', background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.4)', padding: '4px 12px', borderRadius: '2px' }}>
              AJP OFFICIAL
            </span>
          )}
        </div>

        <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '5px', textTransform: 'uppercase', color: etapa.esAJP ? '#c9a227' : '#2a6bc2', marginBottom: '8px' }}>
          {etapa.subtitulo}
        </div>
        <h1 style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: 'clamp(3rem, 10vw, 6rem)', letterSpacing: '6px', lineHeight: 0.9, margin: '0 0 20px' }}>
          {etapa.titulo.toUpperCase()}
        </h1>
        <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '3px', color: '#8a9ab5' }}>
          {etapa.fecha} · {etapa.ciudad}
        </div>
        {etapa.venue !== 'Por confirmar' && (
          <div style={{ fontFamily: 'var(--font-barlow), sans-serif', fontSize: '0.85rem', color: '#8a9ab5', marginTop: '6px' }}>
            {etapa.venue}
          </div>
        )}

        {/* CTA inscripción si es próximo */}
        {etapa.estado === 'proximo' && (
          <div style={{ marginTop: '32px' }}>
            <a href="/inscripcion" style={{ display: 'inline-block', background: etapa.esAJP ? '#c9a227' : '#2a6bc2', color: etapa.esAJP ? '#050810' : '#f0f4ff', fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.85rem', fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', textDecoration: 'none', padding: '14px 36px', borderRadius: '2px' }}>
              INSCRIBITE AHORA
            </a>
            <a href="/inscriptos" style={{ display: 'inline-block', marginLeft: '12px', border: '1px solid rgba(138,154,181,0.4)', color: '#8a9ab5', fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', textDecoration: 'none', padding: '14px 36px', borderRadius: '2px' }}>
              VER INSCRIPTOS
            </a>
          </div>
        )}
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px' }}>

        {/* ── Cronograma ── */}
        {etapa.cronograma ? (
          <section style={{ marginBottom: '72px' }}>
            <SectionHeader label="Día del evento" title="CRONOGRAMA" />
            <div style={{ marginTop: '40px' }}>
              {etapa.cronograma.map((bloque, bi) => (
                <div key={bi} style={{ marginBottom: '36px' }}>
                  <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: bloque.color, marginBottom: '10px', paddingBottom: '8px', borderBottom: `1px solid ${bloque.color}30` }}>
                    {bloque.titulo}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {bloque.items.map((item, ii) => (
                      <div key={ii} style={{ display: 'grid', gridTemplateColumns: '72px 1fr', gap: '16px', padding: '10px 14px', background: item.highlight ? 'rgba(201,162,39,0.07)' : ii % 2 === 0 ? 'rgba(5,8,16,0.5)' : 'rgba(13,33,68,0.2)', borderLeft: item.highlight ? '3px solid #c9a227' : '3px solid transparent' }}>
                        <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: '1.1rem', color: item.highlight ? '#c9a227' : bloque.color, lineHeight: 1.2, letterSpacing: '1px' }}>
                          {item.hora}
                        </div>
                        <div style={{ fontFamily: 'var(--font-barlow), sans-serif', fontSize: '0.88rem', color: item.highlight ? '#e8c14a' : '#d0d8e8', lineHeight: 1.5, fontWeight: item.highlight ? 500 : 400 }}>
                          {item.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <ProximamenteCard titulo="CRONOGRAMA" mensaje="El cronograma se publicará próximo al evento." />
        )}

        {/* ── Reglamento ── */}
        {etapa.reglamento ? (
          <section style={{ marginBottom: '72px' }}>
            <SectionHeader label="No-Gi" title="REGLAMENTO VESTIMENTA" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '40px' }}>
              <ReglaCard titulo="Camiseta" heading="OBLIGATORIO USAR CAMISETA" items={etapa.reglamento.camiseta} />
              <ReglaCard titulo="Shorts" heading="TEJIDO COMPLETAMENTE NEGRO" items={etapa.reglamento.shorts} />
            </div>
            <div style={{ marginTop: '16px', background: 'rgba(201,162,39,0.05)', border: '1px solid rgba(201,162,39,0.2)', borderRadius: '2px', padding: '24px 28px' }}>
              <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: '#c9a227', marginBottom: '16px' }}>
                Por graduación
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {etapa.reglamento.porFaja.map(({ faja, color, ejemplo }) => (
                  <div key={faja} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(5,8,16,0.5)', border: `1px solid ${color}30`, borderRadius: '2px', padding: '10px 16px', flex: '1 1 200px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color }}>{faja}</div>
                      <div style={{ fontFamily: 'var(--font-barlow), sans-serif', fontSize: '0.78rem', color: '#8a9ab5', marginTop: '2px' }}>{ejemplo}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <ProximamenteCard titulo="REGLAMENTO" mensaje="El reglamento se publicará próximo al evento." />
        )}

        {/* ── Brackets ── */}
        <section style={{ marginBottom: '72px' }}>
          <SectionHeader label="Llaves" title="BRACKETS" />
          <div style={{ marginTop: '40px' }}>
            <BracketsSection fechaISO={etapa.fechaISO} />
          </div>
        </section>

        {/* ── Resultados / Podios ── */}
        {etapa.podios.length > 0 ? (
          <section style={{ marginBottom: '72px' }}>
            <SectionHeader label="Resultados" title="PODIOS" />
            {/* TODO V2: tabla de podios */}
          </section>
        ) : etapa.estado === 'finalizado' ? (
          <ProximamenteCard titulo="RESULTADOS" mensaje="Los resultados se están cargando." />
        ) : (
          <section style={{ marginBottom: '72px' }}>
            <SectionHeader label="Resultados" title="PODIOS" />
            <div style={{ marginTop: '40px', textAlign: 'center', padding: '60px 24px', border: '1px solid rgba(42,107,194,0.15)', borderRadius: '2px', background: 'rgba(7,20,40,0.4)' }}>
              <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: '1.8rem', letterSpacing: '4px', color: '#8a9ab5', marginBottom: '12px' }}>
                AÚN NO DISPUTADO
              </div>
              <div style={{ fontFamily: 'var(--font-barlow), sans-serif', fontSize: '0.88rem', color: '#8a9ab5' }}>
                Los podios y medallero se publicarán al finalizar el evento.
              </div>
            </div>
          </section>
        )}

        {/* ── Videos ── */}
        {etapa.videos.length > 0 && (
          <section style={{ marginBottom: '72px' }}>
            <SectionHeader label="Highlights" title="VIDEOS" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '40px' }}>
              {etapa.videos.map((v, i) => (
                <div key={i} style={{ background: 'rgba(7,20,40,0.8)', border: '1px solid rgba(42,107,194,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                    <iframe src={v.url} title={v.titulo} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen />
                  </div>
                  <div style={{ padding: '12px 16px', fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '1px', color: '#d0d8e8' }}>{v.titulo}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Galería ── */}
        {etapa.fotos.length > 0 && (
          <section style={{ marginBottom: '72px' }}>
            <SectionHeader label="Momentos" title="GALERÍA" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', marginTop: '40px' }}>
              {etapa.fotos.map((src, i) => (
                <img key={i} src={src} alt={`Foto ${i + 1}`} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: '2px' }} />
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div style={{ borderBottom: '1px solid rgba(201,162,39,0.15)', paddingBottom: '16px' }}>
      <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '5px', textTransform: 'uppercase', color: '#c9a227', marginBottom: '6px' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', letterSpacing: '4px', lineHeight: 1 }}>
        {title}
      </div>
    </div>
  )
}

function ReglaCard({ titulo, heading, items }: { titulo: string; heading: string; items: string[] }) {
  return (
    <div style={{ background: 'rgba(7,20,40,0.8)', border: '1px solid rgba(42,107,194,0.2)', borderRadius: '2px', padding: '28px' }}>
      <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: '#2a6bc2', marginBottom: '10px' }}>
        {titulo}
      </div>
      <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: '1.4rem', letterSpacing: '2px', marginBottom: '16px', lineHeight: 1 }}>
        {heading}
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((r, i) => (
          <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ color: '#2a6bc2', fontWeight: 700, flexShrink: 0 }}>·</span>
            <span style={{ fontFamily: 'var(--font-barlow), sans-serif', fontSize: '0.85rem', color: '#d0d8e8', lineHeight: 1.5 }}>{r}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ProximamenteCard({ titulo, mensaje }: { titulo: string; mensaje: string }) {
  return (
    <section style={{ marginBottom: '72px' }}>
      <div style={{ borderBottom: '1px solid rgba(201,162,39,0.15)', paddingBottom: '16px', marginBottom: '32px' }}>
        <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', letterSpacing: '4px', lineHeight: 1, color: '#8a9ab5' }}>
          {titulo}
        </div>
      </div>
      <div style={{ textAlign: 'center', padding: '48px 24px', border: '1px solid rgba(42,107,194,0.12)', borderRadius: '2px', background: 'rgba(7,20,40,0.3)' }}>
        <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: '#8a9ab5' }}>
          PRÓXIMAMENTE
        </div>
        <div style={{ fontFamily: 'var(--font-barlow), sans-serif', fontSize: '0.88rem', color: '#8a9ab5', marginTop: '8px' }}>
          {mensaje}
        </div>
      </div>
    </section>
  )
}
