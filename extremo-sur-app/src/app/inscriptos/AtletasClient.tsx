'use client'

import { useState, useMemo } from 'react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Atleta {
  id:        string
  nombre:    string
  academia:  string
  ciudad:    string | null
  faja:      string | null
  genero:    string | null
  division:  string
  categoria: string
  peso_kg:   number
  estado:    string
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const FAJA_COLOR: Record<string, string> = {
  blanca:  '#e2e8f0',
  azul:    '#3b82f6',
  morada:  '#a855f7',
  marron:  '#b45309',
  negra:   '#6b7280',
}

const FAJA_ORDER = ['blanca', 'azul', 'morada', 'marron', 'negra']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cap(s: string | null | undefined) {
  if (!s) return '—'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function getPais(ciudad: string | null) {
  if (!ciudad) return null
  const parts = ciudad.split(',')
  return parts[parts.length - 1]?.trim() ?? null
}

const DIVISION_LABEL: Record<string, string> = {
  gi: 'Gi', nogi: 'No-Gi', ambas: 'Gi + No-Gi',
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function AtletasClient({ inscriptos }: { inscriptos: Atleta[] }) {
  const [search,          setSearch]          = useState('')
  const [filterFaja,      setFilterFaja]      = useState('')
  const [filterCategoria, setFilterCategoria] = useState('')
  const [filterDivision,  setFilterDivision]  = useState('')
  const [filterGenero,    setFilterGenero]    = useState('')

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalAcademias = useMemo(() =>
    new Set(inscriptos.map(r => r.academia)).size, [inscriptos])

  const totalPaises = useMemo(() =>
    new Set(inscriptos.map(r => getPais(r.ciudad)).filter(Boolean)).size, [inscriptos])

  // ── Filtered ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return inscriptos.filter(r => {
      const matchSearch = !q ||
        r.nombre.toLowerCase().includes(q) ||
        r.academia.toLowerCase().includes(q) ||
        (r.ciudad ?? '').toLowerCase().includes(q)
      const matchFaja      = !filterFaja      || r.faja      === filterFaja
      const matchCategoria = !filterCategoria || r.categoria === filterCategoria
      const matchDivision  = !filterDivision  || r.division  === filterDivision
      const matchGenero    = !filterGenero    || r.genero    === filterGenero
      return matchSearch && matchFaja && matchCategoria && matchDivision && matchGenero
    })
  }, [inscriptos, search, filterFaja, filterCategoria, filterDivision, filterGenero])

  const hasFilters = search || filterFaja || filterCategoria || filterDivision || filterGenero

  const clearFilters = () => {
    setSearch(''); setFilterFaja(''); setFilterCategoria('')
    setFilterDivision(''); setFilterGenero('')
  }

  // ── Styles ─────────────────────────────────────────────────────────────────

  const SELECT: React.CSSProperties = {
    background:       'rgba(7,20,40,0.8)',
    border:           '1px solid rgba(42,107,194,0.25)',
    borderRadius:     '2px',
    color:            '#f0f4ff',
    fontFamily:       'var(--font-barlow-condensed), sans-serif',
    fontSize:         '0.78rem',
    fontWeight:       600,
    letterSpacing:    '1px',
    padding:          '10px 32px 10px 14px',
    appearance:       'none',
    WebkitAppearance: 'none',
    cursor:           'pointer',
    outline:          'none',
  }

  return (
    <main style={{
      minHeight:  '100vh',
      background: '#050810',
      color:      '#f0f4ff',
      fontFamily: 'var(--font-barlow), sans-serif',
    }}>

      {/* ── Hero header ── */}
      <div style={{
        background:   'linear-gradient(180deg, #071428 0%, #050810 100%)',
        borderBottom: '1px solid rgba(42,107,194,0.2)',
        padding:      '72px 24px 48px',
        textAlign:    'center',
      }}>
        <a href="/" style={{
          display:       'inline-block',
          fontFamily:    'var(--font-barlow-condensed), sans-serif',
          fontSize:      '0.65rem',
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
          Circuito 2026
        </div>

        <h1 style={{
          fontFamily:   'var(--font-bebas-neue), sans-serif',
          fontSize:     'clamp(3rem, 10vw, 6rem)',
          letterSpacing:'4px',
          lineHeight:   0.9,
          margin:       '0 0 24px',
        }}>
          COMPETIDORES
        </h1>

        {/* Stats */}
        <div style={{
          display:        'flex',
          justifyContent: 'center',
          gap:            '0',
          flexWrap:       'wrap',
          marginBottom:   '8px',
        }}>
          {[
            { n: inscriptos.length, label: 'Atletas' },
            { n: totalAcademias,    label: 'Academias' },
            { n: totalPaises,       label: 'Países' },
          ].map(({ n, label }, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && <div style={{ width: '1px', height: '40px', background: 'rgba(42,107,194,0.3)', margin: '0 32px' }} />}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: '2.8rem', color: '#e8c14a', lineHeight: 1 }}>
                  {n}
                </div>
                <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#8a9ab5', marginTop: '4px' }}>
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* ── Filtros ── */}
        <div style={{
          background:   'rgba(7,20,40,0.6)',
          border:       '1px solid rgba(42,107,194,0.15)',
          borderRadius: '2px',
          padding:      '20px 24px',
          marginBottom: '32px',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a9ab5" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre, academia o ciudad..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width:        '100%',
                background:   'rgba(5,8,16,0.6)',
                border:       '1px solid rgba(42,107,194,0.2)',
                borderRadius: '2px',
                color:        '#f0f4ff',
                fontFamily:   'var(--font-barlow), sans-serif',
                fontSize:     '0.95rem',
                padding:      '12px 16px 12px 42px',
                outline:      'none',
                boxSizing:    'border-box',
              }}
            />
          </div>

          {/* Filtros dropdown */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              {
                value: filterFaja, setter: setFilterFaja,
                placeholder: 'Todas las fajas',
                options: FAJA_ORDER.map(f => ({ value: f, label: cap(f) })),
              },
              {
                value: filterCategoria, setter: setFilterCategoria,
                placeholder: 'Todas las categorías',
                options: [
                  { value: 'kids',     label: 'Kids'     },
                  { value: 'juvenil',  label: 'Juvenil'  },
                  { value: 'adulto',   label: 'Adulto'   },
                  { value: 'master',   label: 'Master'   },
                  { value: 'absoluto', label: 'Absoluto' },
                ],
              },
              {
                value: filterDivision, setter: setFilterDivision,
                placeholder: 'Gi y No-Gi',
                options: [
                  { value: 'gi',    label: 'Gi'       },
                  { value: 'nogi',  label: 'No-Gi'    },
                  { value: 'ambas', label: 'Gi + No-Gi' },
                ],
              },
              {
                value: filterGenero, setter: setFilterGenero,
                placeholder: 'Todos los géneros',
                options: [
                  { value: 'masculino', label: 'Masculino' },
                  { value: 'femenino',  label: 'Femenino'  },
                ],
              },
            ].map(({ value, setter, placeholder, options }) => (
              <div key={placeholder} style={{ position: 'relative' }}>
                <select value={value} onChange={e => setter(e.target.value)} style={SELECT}>
                  <option value="">{placeholder}</option>
                  {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#8a9ab5', pointerEvents: 'none', fontSize: '0.65rem' }}>▼</span>
              </div>
            ))}

            {hasFilters && (
              <button
                onClick={clearFilters}
                style={{
                  background:    'transparent',
                  border:        '1px solid rgba(239,68,68,0.4)',
                  color:         '#ef4444',
                  fontFamily:    'var(--font-barlow-condensed), sans-serif',
                  fontSize:      '0.72rem',
                  fontWeight:    700,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  padding:       '10px 14px',
                  borderRadius:  '2px',
                  cursor:        'pointer',
                }}
              >
                ✕ Limpiar
              </button>
            )}

            {hasFilters && (
              <span style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.78rem', color: '#8a9ab5', marginLeft: '4px' }}>
                {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* ── Lista de atletas ── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#8a9ab5' }}>
            <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: '1.8rem', letterSpacing: '3px', opacity: 0.4, marginBottom: '8px' }}>
              SIN RESULTADOS
            </div>
            <div style={{ fontFamily: 'var(--font-barlow), sans-serif', fontSize: '0.85rem' }}>
              Probá con otros filtros.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {filtered.map((atleta, i) => {
              const fColor = FAJA_COLOR[atleta.faja ?? ''] ?? '#c9a227'
              const pais   = getPais(atleta.ciudad)

              return (
                <div
                  key={atleta.id}
                  style={{
                    display:        'grid',
                    gridTemplateColumns: '48px 1fr auto',
                    alignItems:     'center',
                    gap:            '16px',
                    padding:        '14px 20px',
                    background:     i % 2 === 0 ? 'rgba(5,8,16,0.5)' : 'rgba(13,33,68,0.15)',
                    borderLeft:     `3px solid ${fColor}`,
                    transition:     'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(42,107,194,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'rgba(5,8,16,0.5)' : 'rgba(13,33,68,0.15)')}
                >
                  {/* Número */}
                  <div style={{
                    width:          '40px',
                    height:         '40px',
                    borderRadius:   '50%',
                    background:     `${fColor}18`,
                    border:         `1px solid ${fColor}60`,
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    fontFamily:     'var(--font-bebas-neue), sans-serif',
                    fontSize:       '1rem',
                    color:          fColor,
                    flexShrink:     0,
                  }}>
                    {i + 1}
                  </div>

                  {/* Info */}
                  <div>
                    <div style={{ fontFamily: 'var(--font-barlow), sans-serif', fontWeight: 600, fontSize: '0.95rem', color: '#f0f4ff', marginBottom: '3px' }}>
                      {atleta.nombre}
                    </div>
                    <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.75rem', color: '#8a9ab5', letterSpacing: '0.5px' }}>
                      {atleta.academia}
                      {pais ? (
                        <span style={{ color: '#4a5a70', marginLeft: '8px' }}>· {pais}</span>
                      ) : null}
                    </div>
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {atleta.faja && (
                      <span style={{
                        fontFamily:    'var(--font-barlow-condensed), sans-serif',
                        fontSize:      '0.62rem',
                        fontWeight:    700,
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        color:         fColor,
                        border:        `1px solid ${fColor}60`,
                        padding:       '3px 8px',
                        borderRadius:  '2px',
                        whiteSpace:    'nowrap',
                      }}>
                        {cap(atleta.faja)}
                      </span>
                    )}
                    <span style={{
                      fontFamily:    'var(--font-barlow-condensed), sans-serif',
                      fontSize:      '0.62rem',
                      fontWeight:    700,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      color:         '#8a9ab5',
                      border:        '1px solid rgba(138,154,181,0.25)',
                      padding:       '3px 8px',
                      borderRadius:  '2px',
                      whiteSpace:    'nowrap',
                    }}>
                      {DIVISION_LABEL[atleta.division] ?? cap(atleta.division)}
                    </span>
                    <span style={{
                      fontFamily:    'var(--font-barlow-condensed), sans-serif',
                      fontSize:      '0.62rem',
                      fontWeight:    700,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      color:         '#8a9ab5',
                      border:        '1px solid rgba(138,154,181,0.25)',
                      padding:       '3px 8px',
                      borderRadius:  '2px',
                      whiteSpace:    'nowrap',
                    }}>
                      {cap(atleta.categoria)} · {atleta.peso_kg >= 999 ? 'Abs' : `≤${atleta.peso_kg}kg`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '48px', fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.72rem', letterSpacing: '2px', color: '#4a5a70' }}>
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
