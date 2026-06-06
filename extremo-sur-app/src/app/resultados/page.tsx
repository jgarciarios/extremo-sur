import { AppHeader } from '@/components/AppHeader'

// ─── DATOS — completar con resultados reales de Ricardo ───────────────────────
// Cada objeto es una categoría con su podio.
// Dejar `podios` vacío para mostrar el estado "pendiente de carga".

interface Podio {
  categoria:  string   // "GI · BLANCO · ADULTO · LEVE"
  division:   'gi' | 'nogi'
  faja:       string
  primero:    string
  segundo:    string
  tercero?:   string
  academia1:  string
  academia2:  string
  academia3?: string
}

const PODIOS: Podio[] = [
  // Ejemplo — reemplazar con datos reales:
  // {
  //   categoria: 'GI · BLANCO · ADULTO · LEVE',
  //   division: 'gi', faja: 'blanca',
  //   primero: 'Juan García', academia1: 'Alliance Maldonado',
  //   segundo: 'Pedro López', academia2: 'Gracie Barra',
  //   tercero: 'Carlos Silva', academia3: 'Checkmat',
  // },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FAJA_COLOR: Record<string, string> = {
  blanca: '#e2e8f0', azul: '#3b82f6', morada: '#a855f7',
  marron: '#b45309', negra: '#6b7280',
}

const MEDAL_COLOR = ['#c9a227', '#8a9ab5', '#b45309']
const MEDAL_LABEL = ['ORO', 'PLATA', 'BRONCE']

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResultadosPage() {
  const totalOro    = PODIOS.length
  const totalPlata  = PODIOS.length
  const totalBronce = PODIOS.filter(p => p.tercero).length

  return (
    <main style={{ minHeight: '100vh', background: '#050810', color: '#f0f4ff', fontFamily: 'var(--font-barlow), sans-serif' }}>
      <AppHeader />

      {/* Header */}
      <div style={{
        background:   'linear-gradient(180deg, #071428 0%, #050810 100%)',
        borderBottom: '1px solid rgba(42,107,194,0.2)',
        padding:      '112px 24px 48px',
        textAlign:    'center',
      }}>
        <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '6px', textTransform: 'uppercase', color: '#c9a227', marginBottom: '8px' }}>
          Circuito 2026
        </div>
        <h1 style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: 'clamp(3rem, 10vw, 6rem)', letterSpacing: '4px', lineHeight: 0.9, margin: '0 0 24px' }}>
          RESULTADOS
        </h1>
        <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: '#8a9ab5', marginBottom: '32px' }}>
          1° Etapa · 30 de Mayo 2026 · Maldonado, Uruguay
        </div>

        {/* Medal counters */}
        {PODIOS.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', flexWrap: 'wrap', maxWidth: '720px', margin: '0 auto' }}>
            {[
              { n: totalOro,    color: '#c9a227', label: 'MEDALLAS DE ORO'    },
              { n: totalPlata,  color: '#8a9ab5', label: 'MEDALLAS DE PLATA'  },
              { n: totalBronce, color: '#b45309', label: 'MEDALLAS DE BRONCE' },
            ].map(({ n, color, label }) => (
              <div key={label} style={{
                flex:         '1 1 180px',
                background:   `${color}14`,
                border:       `1px solid ${color}50`,
                padding:      '24px 20px',
                textAlign:    'center',
              }}>
                <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: '3.5rem', color, lineHeight: 1 }}>{n}</div>
                <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color, marginTop: '6px', opacity: 0.8 }}>{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {PODIOS.length === 0 ? (
          // Estado vacío — datos pendientes
          <div style={{ textAlign: 'center', padding: '80px 24px', border: '1px solid rgba(42,107,194,0.15)', borderRadius: '2px', background: 'rgba(7,20,40,0.4)' }}>
            <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: '2rem', letterSpacing: '4px', color: '#8a9ab5', marginBottom: '12px', opacity: 0.5 }}>
              CARGANDO RESULTADOS
            </div>
            <div style={{ fontFamily: 'var(--font-barlow), sans-serif', fontSize: '0.9rem', color: '#8a9ab5', lineHeight: 1.6 }}>
              Los podios de la 1° etapa se publicarán en breve.<br />
              Más de <strong style={{ color: '#e8c14a' }}>400 competidores</strong> disputaron el evento el 30 de mayo en Maldonado.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {PODIOS.map((p, i) => {
              const fColor = FAJA_COLOR[p.faja] ?? '#c9a227'
              const places = [
                { nombre: p.primero,  academia: p.academia1, medal: 0 },
                { nombre: p.segundo,  academia: p.academia2, medal: 1 },
                ...(p.tercero ? [{ nombre: p.tercero, academia: p.academia3 ?? '', medal: 2 }] : []),
              ]

              return (
                <div key={i} style={{ background: 'rgba(7,20,40,0.6)', border: '1px solid rgba(42,107,194,0.12)', overflow: 'hidden' }}>
                  {/* Header categoría */}
                  <div style={{ padding: '10px 20px', background: 'rgba(5,8,16,0.5)', borderBottom: '1px solid rgba(42,107,194,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: fColor, flexShrink: 0 }} />
                    <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: fColor }}>
                      {p.categoria}
                    </div>
                  </div>

                  {/* Podio */}
                  <div>
                    {places.map(({ nombre, academia, medal }) => (
                      <div key={medal} style={{
                        display:     'grid',
                        gridTemplateColumns: '56px 1fr',
                        alignItems:  'center',
                        padding:     '14px 20px',
                        borderBottom: medal < places.length - 1 ? '1px solid rgba(42,107,194,0.08)' : 'none',
                        background:  medal === 0 ? 'rgba(201,162,39,0.05)' : 'transparent',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width:          '32px', height: '32px', borderRadius: '50%',
                            background:     `${MEDAL_COLOR[medal]}20`,
                            border:         `2px solid ${MEDAL_COLOR[medal]}`,
                            display:        'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily:     'var(--font-bebas-neue), sans-serif',
                            fontSize:       '0.9rem', color: MEDAL_COLOR[medal], flexShrink: 0,
                          }}>
                            {medal + 1}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontFamily: 'var(--font-barlow), sans-serif', fontWeight: medal === 0 ? 700 : 500, fontSize: '0.95rem', color: medal === 0 ? '#e8c14a' : '#f0f4ff' }}>
                            {nombre}
                          </div>
                          <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.72rem', color: '#8a9ab5', letterSpacing: '0.5px', marginTop: '2px' }}>
                            {academia}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
