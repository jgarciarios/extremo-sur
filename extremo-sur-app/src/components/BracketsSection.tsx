'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Competidor {
  id:       string
  nombre:   string
  academia: string
}

interface Pelea {
  id:              string
  ronda:           number
  orden:           number
  competidor_1_id: string | null
  competidor_2_id: string | null
  ganador_id:      string | null
  es_bye:          boolean
  estado:          string
}

interface CategoriaInfo {
  id:            string
  division:      string
  faja:          string
  categoria:     string
  genero:        string
  categoria_peso: string
  num_rondas:    number
}

// ─── Constantes visuales ──────────────────────────────────────────────────────

const SLOT   = 76   // px por slot — define el espaciado vertical del árbol
const MHGT   = 64   // altura de cada tarjeta de pelea
const RWIDTH = 210  // ancho de cada columna de ronda
const RGAP   = 56   // gap horizontal entre rondas

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cap(s: string | null | undefined) {
  if (!s) return '—'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const FAJA_COLOR: Record<string, string> = {
  blanca:  '#e2e8f0',
  azul:    '#3b82f6',
  morada:  '#a855f7',
  marron:  '#b45309',
  negra:   '#9ca3af',
}

function labelCategoria(c: CategoriaInfo) {
  const div = c.division === 'nogi' ? 'No-Gi' : 'Gi'
  return `${div} · ${cap(c.faja)} · ${cap(c.categoria_peso)} · ${cap(c.genero)}`
}

// ─── Posicionamiento del bracket ──────────────────────────────────────────────
// Para ronda r (1-indexed), match de orden i (0-indexed):
//   center_slot = i * 2^r + 2^(r-1) - 0.5
//   top = center_slot * SLOT - MHGT / 2

function matchTop(ronda: number, orden: number): number {
  const centerSlot = orden * Math.pow(2, ronda) + Math.pow(2, ronda - 1) - 0.5
  return centerSlot * SLOT - MHGT / 2
}

// Altura total del árbol dado el número de rondas
function treeHeight(numRondas: number): number {
  return Math.pow(2, numRondas) * SLOT
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function CompetidorRow({
  comp, isWinner, isBye,
}: {
  comp:     Competidor | null | undefined
  isWinner: boolean
  isBye:    boolean
}) {
  if (isBye) {
    return (
      <div style={{
        height:      '50%',
        display:     'flex',
        alignItems:  'center',
        padding:     '0 10px',
        color:       '#4a5568',
        fontFamily:  'var(--font-barlow), sans-serif',
        fontSize:    '0.72rem',
        fontStyle:   'italic',
        background:  'rgba(5,8,16,0.6)',
        borderBottom:'1px solid rgba(42,107,194,0.1)',
      }}>
        BYE
      </div>
    )
  }

  if (!comp) {
    return (
      <div style={{
        height:      '50%',
        display:     'flex',
        alignItems:  'center',
        padding:     '0 10px',
        color:       '#4a5568',
        fontFamily:  'var(--font-barlow), sans-serif',
        fontSize:    '0.72rem',
        fontStyle:   'italic',
        background:  'rgba(5,8,16,0.6)',
        borderBottom:'1px solid rgba(42,107,194,0.1)',
      }}>
        Por definir
      </div>
    )
  }

  return (
    <div style={{
      height:      '50%',
      display:     'flex',
      flexDirection:'column',
      justifyContent:'center',
      padding:     '0 10px',
      background:  isWinner ? 'rgba(201,162,39,0.12)' : 'rgba(5,8,16,0.6)',
      borderBottom:'1px solid rgba(42,107,194,0.1)',
      borderLeft:  isWinner ? '2px solid #c9a227' : '2px solid transparent',
      overflow:    'hidden',
      transition:  'background 0.2s',
    }}>
      <div style={{
        fontFamily:  'var(--font-barlow), sans-serif',
        fontSize:    '0.8rem',
        fontWeight:  isWinner ? 700 : 400,
        color:       isWinner ? '#e8c14a' : '#f0f4ff',
        whiteSpace:  'nowrap',
        overflow:    'hidden',
        textOverflow:'ellipsis',
      }}>
        {isWinner && '✓ '}{comp.nombre}
      </div>
      <div style={{
        fontFamily:  'var(--font-barlow-condensed), sans-serif',
        fontSize:    '0.65rem',
        color:       '#8a9ab5',
        letterSpacing:'0.5px',
        marginTop:   '1px',
        whiteSpace:  'nowrap',
        overflow:    'hidden',
        textOverflow:'ellipsis',
      }}>
        {comp.academia}
      </div>
    </div>
  )
}

function MatchCard({
  pelea, c1, c2, ronda, numRondas,
}: {
  pelea:     Pelea
  c1:        Competidor | null
  c2:        Competidor | null
  ronda:     number
  numRondas: number
}) {
  const isFinal  = ronda === numRondas
  const isWinner1 = !!pelea.ganador_id && pelea.ganador_id === pelea.competidor_1_id
  const isWinner2 = !!pelea.ganador_id && pelea.ganador_id === pelea.competidor_2_id

  return (
    <div style={{
      width:        RWIDTH,
      height:       MHGT,
      border:       `1px solid ${isFinal ? 'rgba(201,162,39,0.4)' : 'rgba(42,107,194,0.25)'}`,
      borderRadius: '2px',
      overflow:     'hidden',
      boxShadow:    isFinal ? '0 0 20px rgba(201,162,39,0.1)' : 'none',
      background:   '#071428',
    }}>
      <CompetidorRow comp={c1} isWinner={isWinner1} isBye={pelea.es_bye && !pelea.competidor_1_id} />
      <CompetidorRow comp={c2} isWinner={isWinner2} isBye={pelea.es_bye && !pelea.competidor_2_id} />
    </div>
  )
}

// Líneas conectoras entre rondas (SVG absoluto)
function ConnectorLines({
  peleas, numRondas,
}: {
  peleas:    Pelea[]
  numRondas: number
}) {
  const totalW = numRondas * (RWIDTH + RGAP)
  const totalH = treeHeight(numRondas)

  const lines: React.ReactNode[] = []

  for (let r = 1; r < numRondas; r++) {
    const peleasRonda = peleas.filter(p => p.ronda === r)
    for (let i = 0; i < peleasRonda.length; i += 2) {
      const p0 = peleasRonda[i]
      const p1 = peleasRonda[i + 1]
      if (!p0 || !p1) continue

      const x1 = r * (RWIDTH + RGAP)            // borde derecho de esta ronda
      const x2 = r * (RWIDTH + RGAP) + RGAP     // borde izquierdo de la siguiente ronda

      const y0 = matchTop(r, p0.orden) + MHGT / 2  // centro de la primera pelea
      const y1 = matchTop(r, p1.orden) + MHGT / 2  // centro de la segunda pelea
      const ym = (y0 + y1) / 2                      // punto medio (= posición del siguiente match)

      const mx = x1 + RGAP / 2  // punto de quiebre horizontal

      lines.push(
        <g key={`${r}-${i}`}>
          {/* Línea desde p0 hacia la derecha */}
          <line x1={x1} y1={y0} x2={mx} y2={y0} stroke="rgba(42,107,194,0.35)" strokeWidth={1} />
          {/* Línea desde p1 hacia la derecha */}
          <line x1={x1} y1={y1} x2={mx} y2={y1} stroke="rgba(42,107,194,0.35)" strokeWidth={1} />
          {/* Línea vertical conectando las dos */}
          <line x1={mx} y1={y0} x2={mx} y2={y1} stroke="rgba(42,107,194,0.35)" strokeWidth={1} />
          {/* Línea horizontal al siguiente match */}
          <line x1={mx} y1={ym} x2={x2} y2={ym} stroke="rgba(42,107,194,0.35)" strokeWidth={1} />
        </g>
      )
    }
  }

  return (
    <svg
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      width={totalW}
      height={totalH}
    >
      {lines}
    </svg>
  )
}

// ─── Bracket tree ─────────────────────────────────────────────────────────────

function BracketTree({
  peleas, competidores, numRondas,
}: {
  peleas:      Pelea[]
  competidores: Record<string, Competidor>
  numRondas:   number
}) {
  const totalH = treeHeight(numRondas)
  const totalW = numRondas * (RWIDTH + RGAP) - RGAP

  const rondaLabels = (r: number) => {
    if (r === numRondas)     return 'FINAL'
    if (r === numRondas - 1) return 'SEMIFINAL'
    if (r === numRondas - 2) return 'CUARTOS'
    return `RONDA ${r}`
  }

  return (
    <div style={{ overflowX: 'auto', overflowY: 'auto', paddingBottom: 16 }}>
      {/* Header de rondas */}
      <div style={{
        display:   'flex',
        marginLeft: 0,
        marginBottom: 8,
        width:     totalW,
      }}>
        {Array.from({ length: numRondas }, (_, i) => i + 1).map(r => (
          <div
            key={r}
            style={{
              width:        RWIDTH,
              marginRight:  r < numRondas ? RGAP : 0,
              fontFamily:   'var(--font-barlow-condensed), sans-serif',
              fontSize:     '0.65rem',
              fontWeight:   700,
              letterSpacing:'3px',
              color:        r === numRondas ? '#c9a227' : '#8a9ab5',
              textAlign:    'center',
              textTransform:'uppercase',
            }}
          >
            {rondaLabels(r)}
          </div>
        ))}
      </div>

      {/* Árbol */}
      <div style={{ position: 'relative', width: totalW, height: totalH }}>
        <ConnectorLines peleas={peleas} numRondas={numRondas} />

        {peleas.map(pelea => {
          const top  = matchTop(pelea.ronda, pelea.orden)
          const left = (pelea.ronda - 1) * (RWIDTH + RGAP)
          const c1   = pelea.competidor_1_id ? competidores[pelea.competidor_1_id] : null
          const c2   = pelea.competidor_2_id ? competidores[pelea.competidor_2_id] : null

          return (
            <div key={pelea.id} style={{ position: 'absolute', top, left }}>
              <MatchCard
                pelea={pelea}
                c1={c1}
                c2={c2}
                ronda={pelea.ronda}
                numRondas={numRondas}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── BracketsSection ──────────────────────────────────────────────────────────

export function BracketsSection({ fechaISO }: { fechaISO: string }) {
  const [categorias,   setCategorias]   = useState<CategoriaInfo[]>([])
  const [selectedId,   setSelectedId]   = useState<string | null>(null)
  const [peleas,       setPeleas]       = useState<Pelea[]>([])
  const [competidores, setCompetidores] = useState<Record<string, Competidor>>({})
  const [loading,      setLoading]      = useState(true)
  const [eventoId,     setEventoId]     = useState<string | null>(null)

  // ── Cargar evento y categorías ─────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const supabase = createClient()

      // Buscar evento por fecha
      const { data: eventos } = await supabase
        .from('eventos')
        .select('id')
        .eq('fecha', fechaISO)
        .limit(1)

      const eid = eventos?.[0]?.id
      if (!eid) { setLoading(false); return }
      setEventoId(eid)

      const { data: cats } = await supabase
        .from('categorias_bracket')
        .select('id, division, faja, categoria, genero, categoria_peso, num_rondas')
        .eq('evento_id', eid)
        .order('faja')
        .order('division')
        .order('categoria')

      if (cats?.length) {
        setCategorias(cats)
        setSelectedId(cats[0].id)
      }
      setLoading(false)
    }
    load()
  }, [fechaISO])

  // ── Cargar peleas de la categoría seleccionada ─────────────────────────────
  const loadPeleas = useCallback(async (categoriaId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('peleas')
      .select('id, ronda, orden, competidor_1_id, competidor_2_id, ganador_id, es_bye, estado')
      .eq('categoria_id', categoriaId)
      .order('ronda')
      .order('orden')

    if (!data) return
    setPeleas(data)

    // Cargar nombres de competidores
    const ids = [...new Set(
      data.flatMap(p => [p.competidor_1_id, p.competidor_2_id]).filter(Boolean) as string[]
    )]

    if (!ids.length) return
    const { data: inscriptos } = await supabase
      .from('inscripciones')
      .select('id, nombre, academia')
      .in('id', ids)

    if (inscriptos) {
      const map: Record<string, Competidor> = {}
      inscriptos.forEach(i => { map[i.id] = i })
      setCompetidores(map)
    }
  }, [])

  useEffect(() => {
    if (!selectedId) return
    loadPeleas(selectedId)
  }, [selectedId, loadPeleas])

  // ── Realtime: actualizar cuando cambia una pelea ───────────────────────────
  useEffect(() => {
    if (!selectedId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`peleas-${selectedId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'peleas',
        filter: `categoria_id=eq.${selectedId}`,
      }, () => { loadPeleas(selectedId) })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [selectedId, loadPeleas])

  // ── Estados vacíos ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#8a9ab5', fontFamily: 'var(--font-barlow-condensed), sans-serif', letterSpacing: '2px' }}>
        Cargando brackets...
      </div>
    )
  }

  if (!eventoId || categorias.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: '#8a9ab5', marginBottom: '12px' }}>
          Brackets
        </div>
        <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: '1.8rem', letterSpacing: '3px', color: '#f0f4ff', opacity: 0.3 }}>
          AÚN NO GENERADOS
        </div>
        <div style={{ fontFamily: 'var(--font-barlow), sans-serif', fontSize: '0.85rem', color: '#8a9ab5', marginTop: '8px' }}>
          Se publican una vez cerradas las inscripciones.
        </div>
      </div>
    )
  }

  const selectedCat = categorias.find(c => c.id === selectedId)

  return (
    <div>
      {/* Selector de categorías */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#8a9ab5', marginBottom: '12px' }}>
          {categorias.length} categorías
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {categorias.map(cat => {
            const isSelected = cat.id === selectedId
            const color = FAJA_COLOR[cat.faja] ?? '#c9a227'
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedId(cat.id)}
                style={{
                  background:    isSelected ? `${color}22` : 'rgba(7,20,40,0.6)',
                  border:        `1px solid ${isSelected ? color : 'rgba(42,107,194,0.2)'}`,
                  color:         isSelected ? color : '#8a9ab5',
                  fontFamily:    'var(--font-barlow-condensed), sans-serif',
                  fontSize:      '0.7rem',
                  fontWeight:    700,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  padding:       '6px 14px',
                  borderRadius:  '2px',
                  cursor:        'pointer',
                  transition:    'all 0.15s',
                  whiteSpace:    'nowrap',
                }}
              >
                {labelCategoria(cat)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Título de la categoría seleccionada */}
      {selectedCat && (
        <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(42,107,194,0.15)' }}>
          <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: '1.6rem', letterSpacing: '3px', color: FAJA_COLOR[selectedCat.faja] ?? '#c9a227' }}>
            {cap(selectedCat.faja)} · {selectedCat.division === 'nogi' ? 'No-Gi' : 'Gi'} · {cap(selectedCat.categoria_peso)}
          </div>
          <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.75rem', color: '#8a9ab5', letterSpacing: '2px', marginTop: '4px' }}>
            {cap(selectedCat.categoria)} · {cap(selectedCat.genero)} · {peleas.filter(p => p.ronda === 1 && !p.es_bye).length * 2 + peleas.filter(p => p.ronda === 1 && p.es_bye).length} competidores
          </div>
        </div>
      )}

      {/* Árbol del bracket */}
      {peleas.length > 0 && selectedCat && (
        <div style={{
          background:  'rgba(7,20,40,0.4)',
          border:      '1px solid rgba(42,107,194,0.15)',
          borderRadius:'2px',
          padding:     '24px 20px',
          overflowX:   'auto',
        }}>
          <BracketTree
            peleas={peleas}
            competidores={competidores}
            numRondas={selectedCat.num_rondas}
          />
        </div>
      )}
    </div>
  )
}
