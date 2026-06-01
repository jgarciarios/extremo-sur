'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
  categoria_id:    string
  categoria_info?: {
    division:       string
    faja:           string
    categoria:      string
    genero:         string
    categoria_peso: string
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cap(s: string | null | undefined) {
  if (!s) return '—'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const FAJA_COLOR: Record<string, string> = {
  blanca: '#e2e8f0', azul: '#3b82f6', morada: '#a855f7',
  marron: '#b45309', negra: '#9ca3af',
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function LlamadorPage() {
  const router = useRouter()
  const [peleas,       setPeleas]       = useState<Pelea[]>([])
  const [competidores, setCompetidores] = useState<Record<string, Competidor>>({})
  const [loading,      setLoading]      = useState(true)
  const [eventoId,     setEventoId]     = useState<string | null>(null)
  const [confirmando,  setConfirmando]  = useState<{ pelea: Pelea; ganador: Competidor } | null>(null)
  const [guardando,    setGuardando]    = useState(false)
  const [mensaje,      setMensaje]      = useState<{ texto: string; tipo: 'ok' | 'error' } | null>(null)

  // ── Auth check ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/admin/login'); return }
      const { data: profile } = await supabase.from('profiles').select('rol').eq('id', user.id).single()
      if (!['admin', 'superadmin', 'llamador'].includes(profile?.rol ?? '')) {
        router.push('/')
      }
    }
    checkAuth()
  }, [router])

  // ── Cargar peleas activas ─────────────────────────────────────────────────
  const cargarPeleas = useCallback(async () => {
    const supabase = createClient()

    const { data: eventos } = await supabase
      .from('eventos').select('id').eq('activo', true).limit(1)
    const eid = eventos?.[0]?.id
    if (!eid) { setLoading(false); return }
    setEventoId(eid)

    // Obtener categorías del evento
    const { data: cats } = await supabase
      .from('categorias_bracket')
      .select('id, division, faja, categoria, genero, categoria_peso')
      .eq('evento_id', eid)
      .neq('estado', 'finalizado')

    if (!cats?.length) { setLoading(false); return }

    const catIds = cats.map(c => c.id)
    const catMap = Object.fromEntries(cats.map(c => [c.id, c]))

    // Obtener peleas pendientes (no byes, no finalizadas)
    const { data: raw } = await supabase
      .from('peleas')
      .select('id, ronda, orden, competidor_1_id, competidor_2_id, ganador_id, es_bye, estado, categoria_id')
      .in('categoria_id', catIds)
      .eq('es_bye', false)
      .neq('estado', 'finalizado')
      .not('competidor_1_id', 'is', null)
      .not('competidor_2_id', 'is', null)
      .order('ronda')
      .order('orden')

    if (!raw?.length) { setLoading(false); return }

    const peleasConCat = raw.map(p => ({ ...p, categoria_info: catMap[p.categoria_id] }))
    setPeleas(peleasConCat)

    // Cargar nombres
    const ids = [...new Set(
      raw.flatMap(p => [p.competidor_1_id, p.competidor_2_id]).filter(Boolean) as string[]
    )]
    const { data: inscriptos } = await supabase
      .from('inscripciones').select('id, nombre, academia').in('id', ids)

    if (inscriptos) {
      const map: Record<string, Competidor> = {}
      inscriptos.forEach(i => { map[i.id] = i })
      setCompetidores(map)
    }

    setLoading(false)
  }, [])

  useEffect(() => { cargarPeleas() }, [cargarPeleas])

  // ── Realtime ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!eventoId) return
    const supabase = createClient()
    const channel = supabase
      .channel('llamador-peleas')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'peleas' },
        () => { cargarPeleas() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [eventoId, cargarPeleas])

  // ── Guardar resultado ─────────────────────────────────────────────────────
  async function guardarResultado() {
    if (!confirmando) return
    setGuardando(true)
    try {
      const res = await fetch('/api/brackets/resultado', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          pelea_id:   confirmando.pelea.id,
          ganador_id: confirmando.ganador.id,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMensaje({ texto: `✓ ${confirmando.ganador.nombre} ganó`, tipo: 'ok' })
      setConfirmando(null)
      await cargarPeleas()
      setTimeout(() => setMensaje(null), 3000)
    } catch (e: unknown) {
      setMensaje({ texto: e instanceof Error ? e.message : 'Error', tipo: 'error' })
    }
    setGuardando(false)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <main style={{
      minHeight:  '100vh',
      background: '#050810',
      color:      '#f0f4ff',
      fontFamily: 'var(--font-barlow), sans-serif',
      paddingBottom: 40,
    }}>

      {/* Header */}
      <div style={{
        background:   '#071428',
        borderBottom: '1px solid rgba(42,107,194,0.2)',
        padding:      '16px 20px',
        display:      'flex',
        justifyContent:'space-between',
        alignItems:   'center',
        position:     'sticky',
        top:          0,
        zIndex:       10,
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: '#c9a227' }}>
            Panel
          </div>
          <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: '1.6rem', letterSpacing: '3px', lineHeight: 1 }}>
            LLAMADOR
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ background: 'none', border: '1px solid rgba(138,154,181,0.3)', color: '#8a9ab5', fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '8px 14px', cursor: 'pointer', borderRadius: '2px' }}
        >
          Salir
        </button>
      </div>

      {/* Toast mensaje */}
      {mensaje && (
        <div style={{
          position:      'fixed',
          top:           72,
          left:          '50%',
          transform:     'translateX(-50%)',
          zIndex:        100,
          background:    mensaje.tipo === 'ok' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
          border:        `1px solid ${mensaje.tipo === 'ok' ? '#22c55e' : '#ef4444'}`,
          color:         mensaje.tipo === 'ok' ? '#22c55e' : '#ef4444',
          padding:       '12px 24px',
          fontFamily:    'var(--font-barlow-condensed), sans-serif',
          fontSize:      '0.9rem',
          fontWeight:    700,
          letterSpacing: '1px',
          borderRadius:  '4px',
          whiteSpace:    'nowrap',
        }}>
          {mensaje.texto}
        </div>
      )}

      <div style={{ padding: '20px 16px', maxWidth: '600px', margin: '0 auto' }}>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#8a9ab5', fontFamily: 'var(--font-barlow-condensed), sans-serif', letterSpacing: '2px' }}>
            Cargando peleas...
          </div>
        )}

        {/* Sin peleas */}
        {!loading && peleas.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: '2rem', letterSpacing: '3px', color: '#22c55e', marginBottom: '8px' }}>
              TODO AL DÍA
            </div>
            <div style={{ color: '#8a9ab5', fontSize: '0.9rem' }}>
              No hay peleas pendientes en este momento.
            </div>
          </div>
        )}

        {/* Lista de peleas */}
        {peleas.map((pelea, i) => {
          const c1 = pelea.competidor_1_id ? competidores[pelea.competidor_1_id] : null
          const c2 = pelea.competidor_2_id ? competidores[pelea.competidor_2_id] : null
          const cat = pelea.categoria_info
          const fColor = FAJA_COLOR[cat?.faja ?? ''] ?? '#c9a227'

          return (
            <div key={pelea.id} style={{
              marginBottom:  '16px',
              border:        '1px solid rgba(42,107,194,0.2)',
              borderRadius:  '4px',
              overflow:      'hidden',
              background:    'rgba(7,20,40,0.6)',
            }}>
              {/* Info categoría */}
              <div style={{
                padding:      '10px 16px',
                background:   'rgba(5,8,16,0.6)',
                borderBottom: '1px solid rgba(42,107,194,0.15)',
                display:      'flex',
                justifyContent:'space-between',
                alignItems:   'center',
              }}>
                <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: fColor }}>
                  {cat?.division === 'nogi' ? 'No-Gi' : 'Gi'} · {cap(cat?.faja)} · {cap(cat?.categoria_peso)} · {cap(cat?.categoria)}
                </div>
                <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.65rem', color: '#8a9ab5', letterSpacing: '2px' }}>
                  R{pelea.ronda} · #{i + 1}
                </div>
              </div>

              {/* Competidores */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr' }}>
                {/* Competidor 1 */}
                <button
                  onClick={() => c1 && setConfirmando({ pelea, ganador: c1 })}
                  disabled={!c1}
                  style={{
                    background:  'transparent',
                    border:      'none',
                    padding:     '20px 16px',
                    cursor:      c1 ? 'pointer' : 'default',
                    textAlign:   'left',
                    transition:  'background 0.15s',
                  }}
                  onMouseEnter={e => { if (c1) e.currentTarget.style.background = 'rgba(34,197,94,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ fontFamily: 'var(--font-barlow), sans-serif', fontSize: '1rem', fontWeight: 600, color: '#f0f4ff', marginBottom: '4px' }}>
                    {c1?.nombre ?? 'Por definir'}
                  </div>
                  <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.75rem', color: '#8a9ab5', letterSpacing: '1px' }}>
                    {c1?.academia}
                  </div>
                  {c1 && (
                    <div style={{ marginTop: '10px', fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '2px', color: '#22c55e', textTransform: 'uppercase' }}>
                      TAP → GANÓ
                    </div>
                  )}
                </button>

                {/* VS */}
                <div style={{
                  display:       'flex',
                  alignItems:    'center',
                  justifyContent:'center',
                  padding:       '0 8px',
                  fontFamily:    'var(--font-bebas-neue), sans-serif',
                  fontSize:      '1.2rem',
                  color:         '#8a9ab5',
                  letterSpacing: '2px',
                  borderLeft:    '1px solid rgba(42,107,194,0.15)',
                  borderRight:   '1px solid rgba(42,107,194,0.15)',
                }}>
                  VS
                </div>

                {/* Competidor 2 */}
                <button
                  onClick={() => c2 && setConfirmando({ pelea, ganador: c2 })}
                  disabled={!c2}
                  style={{
                    background:  'transparent',
                    border:      'none',
                    padding:     '20px 16px',
                    cursor:      c2 ? 'pointer' : 'default',
                    textAlign:   'right',
                    transition:  'background 0.15s',
                  }}
                  onMouseEnter={e => { if (c2) e.currentTarget.style.background = 'rgba(34,197,94,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ fontFamily: 'var(--font-barlow), sans-serif', fontSize: '1rem', fontWeight: 600, color: '#f0f4ff', marginBottom: '4px' }}>
                    {c2?.nombre ?? 'Por definir'}
                  </div>
                  <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.75rem', color: '#8a9ab5', letterSpacing: '1px' }}>
                    {c2?.academia}
                  </div>
                  {c2 && (
                    <div style={{ marginTop: '10px', fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '2px', color: '#22c55e', textTransform: 'uppercase' }}>
                      GANÓ ← TAP
                    </div>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal de confirmación */}
      {confirmando && (
        <div
          onClick={() => !guardando && setConfirmando(null)}
          style={{
            position:       'fixed',
            inset:          0,
            background:     'rgba(5,8,16,0.92)',
            zIndex:         50,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            padding:        '24px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background:   '#071428',
              border:       '1px solid rgba(42,107,194,0.3)',
              borderRadius: '8px',
              padding:      '32px 24px',
              width:        '100%',
              maxWidth:     '400px',
              textAlign:    'center',
            }}
          >
            <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: '#8a9ab5', marginBottom: '16px' }}>
              Confirmar resultado
            </div>
            <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: '1.4rem', letterSpacing: '2px', color: '#22c55e', marginBottom: '4px' }}>
              GANÓ
            </div>
            <div style={{ fontFamily: 'var(--font-barlow), sans-serif', fontSize: '1.2rem', fontWeight: 700, color: '#f0f4ff', marginBottom: '4px' }}>
              {confirmando.ganador.nombre}
            </div>
            <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.8rem', color: '#8a9ab5', marginBottom: '32px' }}>
              {confirmando.ganador.academia}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                onClick={() => setConfirmando(null)}
                disabled={guardando}
                style={{
                  background:    'transparent',
                  border:        '1px solid rgba(138,154,181,0.3)',
                  color:         '#8a9ab5',
                  fontFamily:    'var(--font-barlow-condensed), sans-serif',
                  fontSize:      '0.9rem',
                  fontWeight:    700,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  padding:       '14px',
                  borderRadius:  '4px',
                  cursor:        'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={guardarResultado}
                disabled={guardando}
                style={{
                  background:    guardando ? 'rgba(34,197,94,0.4)' : '#22c55e',
                  border:        'none',
                  color:         '#050810',
                  fontFamily:    'var(--font-barlow-condensed), sans-serif',
                  fontSize:      '0.9rem',
                  fontWeight:    900,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  padding:       '14px',
                  borderRadius:  '4px',
                  cursor:        guardando ? 'wait' : 'pointer',
                }}
              >
                {guardando ? 'GUARDANDO...' : 'CONFIRMAR'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
