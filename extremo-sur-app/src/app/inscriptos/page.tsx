import { createClient } from '@/lib/supabase/server'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cap(s: string | null) {
  if (!s) return '—'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const FAJA_COLOR: Record<string, string> = {
  blanca:  '#f0f4ff',
  azul:    '#3b82f6',
  morada:  '#a855f7',
  marron:  '#92400e',
  negra:   '#6b7280',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const revalidate = 60 // revalida cada 60s

export default async function InscriptosPage() {
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from('inscripciones')
    .select('id, nombre, academia, ciudad, faja, genero, division, categoria, peso_kg, estado')
    .order('nombre', { ascending: true })

  const inscriptos = rows ?? []
  const total      = inscriptos.length
  const pagadas    = inscriptos.filter((r: any) => r.estado === 'confirmado').length

  return (
    <main style={{
      minHeight:   '100vh',
      background:  '#050810',
      color:       '#f0f4ff',
      padding:     '60px 24px',
      fontFamily:  'var(--font-barlow), sans-serif',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <a href="/" style={{
            display:       'inline-block',
            fontFamily:    'var(--font-barlow-condensed), sans-serif',
            fontSize:      '0.7rem',
            fontWeight:    700,
            letterSpacing: '4px',
            textTransform: 'uppercase',
            color:         '#8a9ab5',
            textDecoration:'none',
            marginBottom:  '24px',
          }}>
            ← Extremo Sur BJJ
          </a>
          <div style={{
            fontFamily:    'var(--font-barlow-condensed), sans-serif',
            fontSize:      '0.7rem',
            fontWeight:    700,
            letterSpacing: '6px',
            textTransform: 'uppercase',
            color:         '#c9a227',
            marginBottom:  '8px',
          }}>
            1° Etapa · 30 de Mayo 2026
          </div>
          <h1 style={{
            fontFamily:  'var(--font-bebas-neue), sans-serif',
            fontSize:    'clamp(2.5rem, 8vw, 5rem)',
            letterSpacing:'4px',
            lineHeight:  1,
            margin:      '0 0 16px',
          }}>
            INSCRIPTOS
          </h1>

          {/* Stats */}
          <div style={{
            display:        'flex',
            justifyContent: 'center',
            gap:            '32px',
            flexWrap:       'wrap',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: '2.5rem', color: '#e8c14a', lineHeight: 1 }}>
                {total}
              </div>
              <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#8a9ab5', marginTop: '4px' }}>
                Competidores
              </div>
            </div>
            <div style={{ width: '1px', background: 'rgba(42,107,194,0.3)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: '2.5rem', color: '#e8c14a', lineHeight: 1 }}>
                {[...new Set(inscriptos.map((r: any) => r.academia))].length}
              </div>
              <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#8a9ab5', marginTop: '4px' }}>
                Academias
              </div>
            </div>
            <div style={{ width: '1px', background: 'rgba(42,107,194,0.3)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: '2.5rem', color: '#e8c14a', lineHeight: 1 }}>
                {[...new Set(inscriptos.map((r: any) => r.ciudad?.split(',')[1]?.trim()).filter(Boolean))].length}
              </div>
              <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#8a9ab5', marginTop: '4px' }}>
                Países
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: '80px', height: '2px', background: 'linear-gradient(90deg, transparent, #c9a227, transparent)', margin: '0 auto 40px' }} />

        {/* Lista */}
        {inscriptos.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#8a9ab5', padding: '60px 0', fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '1rem', letterSpacing: '2px' }}>
            Las inscripciones aún no han comenzado.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {inscriptos.map((r: any, i: number) => (
              <div
                key={r.id}
                style={{
                  display:        'grid',
                  gridTemplateColumns: '1fr auto',
                  alignItems:     'center',
                  gap:            '16px',
                  padding:        '16px 20px',
                  background:     i % 2 === 0 ? 'rgba(5,8,16,0.6)' : 'rgba(13,33,68,0.2)',
                  borderLeft:     `3px solid ${FAJA_COLOR[r.faja] ?? '#c9a227'}`,
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: '3px' }}>
                    {r.nombre}
                  </div>
                  <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.75rem', color: '#8a9ab5', letterSpacing: '1px' }}>
                    {r.academia}
                    {r.ciudad ? ` · ${r.ciudad}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {r.faja && (
                    <span style={{
                      fontFamily:    'var(--font-barlow-condensed), sans-serif',
                      fontSize:      '0.65rem',
                      fontWeight:    700,
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      color:         FAJA_COLOR[r.faja] ?? '#c9a227',
                      border:        `1px solid ${FAJA_COLOR[r.faja] ?? '#c9a227'}`,
                      padding:       '3px 8px',
                      borderRadius:  '2px',
                      opacity:       0.85,
                    }}>
                      {cap(r.faja)}
                    </span>
                  )}
                  <span style={{
                    fontFamily:    'var(--font-barlow-condensed), sans-serif',
                    fontSize:      '0.65rem',
                    fontWeight:    700,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    color:         '#8a9ab5',
                    border:        '1px solid rgba(138,154,181,0.3)',
                    padding:       '3px 8px',
                    borderRadius:  '2px',
                  }}>
                    {r.division === 'nogi' ? 'No-Gi' : cap(r.division)}
                  </span>
                  <span style={{
                    fontFamily:    'var(--font-barlow-condensed), sans-serif',
                    fontSize:      '0.65rem',
                    fontWeight:    700,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    color:         '#8a9ab5',
                    border:        '1px solid rgba(138,154,181,0.3)',
                    padding:       '3px 8px',
                    borderRadius:  '2px',
                  }}>
                    {cap(r.categoria)} · {r.peso_kg} kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer note */}
        <div style={{ textAlign: 'center', marginTop: '48px', fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.75rem', letterSpacing: '2px', color: '#8a9ab5' }}>
          Lista actualizada automáticamente · ¿No aparecés?{' '}
          <a
            href="https://wa.me/59895246268"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#25d366', textDecoration: 'none' }}
          >
            Contactá a Ricardo
          </a>
        </div>

      </div>
    </main>
  )
}
