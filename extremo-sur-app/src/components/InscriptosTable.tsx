'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Inscripcion } from '@/lib/types'

// ─── Styles ───────────────────────────────────────────────────────────────────

const TH: React.CSSProperties = {
  fontFamily:    'var(--font-barlow-condensed), sans-serif',
  fontSize:      '0.68rem',
  fontWeight:    700,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color:         '#c9a227',
  padding:       '14px 16px',
  textAlign:     'left',
  borderBottom:  '1px solid rgba(201,162,39,0.2)',
  whiteSpace:    'nowrap',
}

const TD: React.CSSProperties = {
  fontFamily:   'var(--font-barlow), sans-serif',
  fontSize:     '0.875rem',
  color:        '#f0f4ff',
  padding:      '14px 16px',
  borderBottom: '1px solid rgba(42,107,194,0.1)',
  verticalAlign:'middle',
}

const TD_GRAY: React.CSSProperties = { ...TD, color: '#8a9ab5' }

const BTN_BASE: React.CSSProperties = {
  background:    'transparent',
  border:        '1px solid rgba(201,162,39,0.4)',
  color:         '#c9a227',
  fontFamily:    'var(--font-barlow-condensed), sans-serif',
  fontSize:      '0.8rem',
  fontWeight:    700,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  padding:       '10px 20px',
  borderRadius:  '2px',
  cursor:        'pointer',
  transition:    'background 0.2s',
  whiteSpace:    'nowrap' as const,
}

const INPUT_FILTER: React.CSSProperties = {
  background:   'rgba(13,33,68,0.8)',
  border:       '1px solid rgba(42,107,194,0.3)',
  borderRadius: '2px',
  color:        '#f0f4ff',
  fontFamily:   'var(--font-barlow), sans-serif',
  fontSize:     '0.85rem',
  padding:      '8px 14px',
  outline:      'none',
}

const SELECT_FILTER: React.CSSProperties = {
  ...INPUT_FILTER,
  appearance:       'none',
  WebkitAppearance: 'none',
  paddingRight:     '32px',
  cursor:           'pointer',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function capitalize(s: string | null) {
  if (!s) return '—'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ─── CSV export ───────────────────────────────────────────────────────────────

function exportCSV(rows: Inscripcion[]) {
  const HEADERS = [
    'Nombre', 'Documento', 'Email', 'Teléfono', 'Academia', 'Ciudad',
    'Faixa', 'Género', 'División', 'Categoría', 'Peso (kg)', 'Estado', 'Pagado', 'Fecha',
  ]
  const escape = (v: string | number | boolean | null) => {
    const s = v === null || v === undefined ? '' : String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }
  const lines = [
    HEADERS.join(','),
    ...rows.map(r => [
      r.nombre, r.documento, r.email, r.telefono ?? '',
      r.academia, r.ciudad, r.faja ?? '', r.genero ?? '',
      r.division, r.categoria, r.peso_kg,
      r.estado, r.pagado ? 'Sí' : 'No', formatDate(r.created_at),
    ].map(escape).join(',')),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `inscriptos_${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Component ────────────────────────────────────────────────────────────────

type CompModal = {
  id:        string
  nombre:    string
  academia:  string
  faja:      string | null
  categoria: string
  peso_kg:   number
  estado:    string
  pagado:    boolean
  url:       string
}

export function InscriptosTable({ inscripciones }: { inscripciones: Inscripcion[] }) {
  const router = useRouter()
  const [rows,          setRows]          = useState<Inscripcion[]>(inscripciones)
  const [toggling,      setToggling]      = useState<string | null>(null)
  const [changingState, setChangingState] = useState<string | null>(null)
  const [bracketStatus, setBracketStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [compModal,     setCompModal]     = useState<CompModal | null>(null)
  const [confirming,    setConfirming]    = useState(false)

  // Filters
  const [search,          setSearch]          = useState('')
  const [filterFaja,      setFilterFaja]      = useState('')
  const [filterPago,      setFilterPago]      = useState('')
  const [filterCategoria, setFilterCategoria] = useState('')
  const [filterDivision,  setFilterDivision]  = useState('')

  // ── Realtime — nuevas inscripciones en vivo ────────────────────────────────
  useEffect(() => {
    const supabase = createClient()
    const channel  = supabase
      .channel('inscripciones-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'inscripciones' },
        payload => {
          setRows(prev => {
            // Evitar duplicados si ya estaba en el server-render
            if (prev.find(r => r.id === payload.new.id)) return prev
            return [payload.new as Inscripcion, ...prev]
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // ── Toggle pagado ──────────────────────────────────────────────────────────
  async function togglePagado(id: string, current: boolean) {
    setToggling(id)
    setRows(prev => prev.map(r => r.id === id ? { ...r, pagado: !current } : r))
    const supabase = createClient()
    const { error } = await supabase
      .from('inscripciones').update({ pagado: !current }).eq('id', id)
    if (error) setRows(prev => prev.map(r => r.id === id ? { ...r, pagado: current } : r))
    setToggling(null)
  }

  // ── Cambiar estado ─────────────────────────────────────────────────────────
  async function cambiarEstado(id: string, prev_estado: string, nuevo_estado: string) {
    if (nuevo_estado === prev_estado) return
    setChangingState(id)
    setRows(prev => prev.map(r => r.id === id ? { ...r, estado: nuevo_estado as Inscripcion['estado'] } : r))
    const supabase = createClient()
    const { error } = await supabase
      .from('inscripciones').update({ estado: nuevo_estado }).eq('id', id)
    if (error) setRows(prev => prev.map(r => r.id === id ? { ...r, estado: prev_estado as Inscripcion['estado'] } : r))
    setChangingState(null)
  }

  // ── Confirmar pago desde el modal ─────────────────────────────────────────
  async function confirmarPago(id: string) {
    setConfirming(true)
    const supabase = createClient()
    await supabase.from('inscripciones').update({ pagado: true, estado: 'confirmado' }).eq('id', id)
    setRows(prev => prev.map(r => r.id === id ? { ...r, pagado: true, estado: 'confirmado' as Inscripcion['estado'] } : r))
    setConfirming(false)
    setCompModal(null)
  }

  async function rechazarPago(id: string) {
    const supabase = createClient()
    await supabase.from('inscripciones').update({ estado: 'pendiente' }).eq('id', id)
    setRows(prev => prev.map(r => r.id === id ? { ...r, estado: 'pendiente' as Inscripcion['estado'] } : r))
    setCompModal(null)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  async function handleGenerarBrackets() {
    // Buscar evento activo
    const supabase = createClient()
    const { data: eventos } = await supabase
      .from('eventos')
      .select('id, nombre')
      .eq('activo', true)
      .limit(1)

    const evento = eventos?.[0]
    if (!evento) {
      alert('No hay ningún evento activo configurado.')
      return
    }

    const pagados = rows.filter(r => r.pagado).length
    if (pagados < 2) {
      alert(`Solo hay ${pagados} inscripto(s) con pago confirmado. Se necesitan al menos 2.`)
      return
    }

    const ok = confirm(
      `¿Generar brackets para "${evento.nombre}"?\n\n` +
      `Se van a usar los ${pagados} inscriptos con pago confirmado.\n` +
      `Si ya había brackets generados, se van a reemplazar.`
    )
    if (!ok) return

    setBracketStatus('loading')
    try {
      const res = await fetch('/api/brackets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evento_id: evento.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setBracketStatus('ok')
      alert(`✓ Brackets generados:\n${data.categorias} categorías · ${data.peleas} peleas`)
    } catch (e: unknown) {
      setBracketStatus('error')
      alert(`Error: ${e instanceof Error ? e.message : 'desconocido'}`)
    }
  }

  // ── Filtered rows ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return rows.filter(r => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        r.nombre.toLowerCase().includes(q) ||
        r.academia.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.ciudad ?? '').toLowerCase().includes(q) ||
        (r.telefono ?? '').toLowerCase().includes(q)
      const matchFaja      = !filterFaja      || r.faja     === filterFaja
      const matchCategoria = !filterCategoria || r.categoria === filterCategoria
      const matchDivision  = !filterDivision  || r.division  === filterDivision
      const matchPago =
        filterPago === ''        ? true :
        filterPago === 'pagado'  ? r.pagado :
        /* pendiente */            !r.pagado
      return matchSearch && matchFaja && matchCategoria && matchDivision && matchPago
    })
  }, [rows, search, filterFaja, filterCategoria, filterDivision, filterPago])

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalPagados = rows.filter(r => r.pagado).length

  // ── Fajas únicas para el select ────────────────────────────────────────────
  const fajas = useMemo(() =>
    [...new Set(rows.map(r => r.faja).filter(Boolean))].sort() as string[],
    [rows]
  )

  return (
    <div style={{ minHeight: '100vh', background: '#050810', color: '#f0f4ff', padding: '40px 32px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '6px', textTransform: 'uppercase', color: '#c9a227', marginBottom: '8px' }}>
            Panel Administrativo
          </div>
          <h1 style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '4px', lineHeight: 1 }}>
            INSCRIPTOS
          </h1>
          {/* Contador en tiempo real */}
          <div style={{ fontFamily: 'var(--font-barlow), sans-serif', fontSize: '0.875rem', color: '#8a9ab5', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', flexShrink: 0 }} />
            <span>
              <strong style={{ color: '#f0f4ff' }}>{rows.length}</strong> registros en total ·{' '}
              <strong style={{ color: '#22c55e' }}>{totalPagados}</strong> pagados ·{' '}
              <strong style={{ color: '#ef4444' }}>{rows.length - totalPagados}</strong> pendientes
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* Generar brackets */}
          <button
            onClick={handleGenerarBrackets}
            disabled={bracketStatus === 'loading'}
            style={{
              ...BTN_BASE,
              borderColor: bracketStatus === 'ok'    ? 'rgba(201,162,39,0.6)'
                         : bracketStatus === 'error' ? 'rgba(239,68,68,0.5)'
                         : 'rgba(42,107,194,0.5)',
              color: bracketStatus === 'ok'    ? '#c9a227'
                   : bracketStatus === 'error' ? '#ef4444'
                   : '#2a6bc2',
              opacity: bracketStatus === 'loading' ? 0.6 : 1,
              cursor:  bracketStatus === 'loading' ? 'wait' : 'pointer',
            }}
            onMouseEnter={e => { if (bracketStatus !== 'loading') e.currentTarget.style.background = 'rgba(42,107,194,0.08)' }}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {bracketStatus === 'loading' ? '⟳ GENERANDO...'
           : bracketStatus === 'ok'     ? '✓ BRACKETS OK'
           : '⬡ GENERAR BRACKETS'}
          </button>
          {/* CSV export */}
          <button
            onClick={() => exportCSV(filtered)}
            style={{ ...BTN_BASE, borderColor: 'rgba(34,197,94,0.5)', color: '#22c55e' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34,197,94,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            ↓ Exportar CSV
          </button>
          <button
            onClick={handleLogout}
            style={BTN_BASE}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,162,39,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* ── Filtros ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="search"
          placeholder="Buscar nombre, academia, email, teléfono..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...INPUT_FILTER, minWidth: '260px', flex: 1 }}
        />
        <div style={{ position: 'relative' }}>
          <select value={filterFaja} onChange={e => setFilterFaja(e.target.value)} style={SELECT_FILTER}>
            <option value="">Todas las fajas</option>
            {fajas.map(f => <option key={f} value={f}>{capitalize(f)}</option>)}
          </select>
          <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#8a9ab5', pointerEvents: 'none', fontSize: '0.7rem' }}>▼</span>
        </div>
        <div style={{ position: 'relative' }}>
          <select value={filterCategoria} onChange={e => setFilterCategoria(e.target.value)} style={SELECT_FILTER}>
            <option value="">Todas las categorías</option>
            <option value="kids">Kids</option>
            <option value="juvenil">Juvenil</option>
            <option value="adulto">Adulto</option>
            <option value="master">Master</option>
            <option value="absoluto">Absoluto</option>
          </select>
          <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#8a9ab5', pointerEvents: 'none', fontSize: '0.7rem' }}>▼</span>
        </div>
        <div style={{ position: 'relative' }}>
          <select value={filterDivision} onChange={e => setFilterDivision(e.target.value)} style={SELECT_FILTER}>
            <option value="">Gi y No-Gi</option>
            <option value="gi">Gi</option>
            <option value="nogi">No-Gi</option>
            <option value="ambas">Ambas</option>
          </select>
          <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#8a9ab5', pointerEvents: 'none', fontSize: '0.7rem' }}>▼</span>
        </div>
        <div style={{ position: 'relative' }}>
          <select value={filterPago} onChange={e => setFilterPago(e.target.value)} style={SELECT_FILTER}>
            <option value="">Pago: todos</option>
            <option value="pagado">Pagado</option>
            <option value="pendiente">Pendiente</option>
          </select>
          <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#8a9ab5', pointerEvents: 'none', fontSize: '0.7rem' }}>▼</span>
        </div>
        {(search || filterFaja || filterPago || filterCategoria || filterDivision) && (
          <button
            onClick={() => { setSearch(''); setFilterFaja(''); setFilterPago(''); setFilterCategoria(''); setFilterDivision('') }}
            style={{ ...BTN_BASE, padding: '8px 14px', fontSize: '0.72rem', borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            ✕ Limpiar
          </button>
        )}
        {(search || filterFaja || filterPago || filterCategoria || filterDivision) && (
          <span style={{ fontFamily: 'var(--font-barlow), sans-serif', fontSize: '0.8rem', color: '#8a9ab5' }}>
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Table ── */}
      <div style={{ overflowX: 'auto', border: '1px solid rgba(42,107,194,0.15)', borderRadius: '2px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1050px' }}>
          <thead>
            <tr style={{ background: 'rgba(7,20,40,0.8)' }}>
              <th style={TH}>Nombre</th>
              <th style={TH}>Academia</th>
              <th style={TH}>Faixa</th>
              <th style={TH}>Género</th>
              <th style={TH}>División</th>
              <th style={TH}>Categoría</th>
              <th style={{ ...TH, textAlign: 'right' }}>Peso</th>
              <th style={TH}>Estado</th>
              <th style={{ ...TH, textAlign: 'center' }}>Pagado</th>
              <th style={{ ...TH, textAlign: 'center' }}>Comp.</th>
              <th style={TH}>Teléfono</th>
              <th style={TH}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={12} style={{ ...TD, textAlign: 'center', color: '#8a9ab5', padding: '40px' }}>
                  {rows.length === 0 ? 'Sin inscripciones aún.' : 'Ningún resultado para los filtros aplicados.'}
                </td>
              </tr>
            )}
            {filtered.map((row, i) => (
              <tr
                key={row.id}
                style={{ background: i % 2 === 0 ? 'rgba(5,8,16,0.4)' : 'rgba(13,33,68,0.2)', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(42,107,194,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'rgba(5,8,16,0.4)' : 'rgba(13,33,68,0.2)')}
              >
                <td style={TD}>
                  <div style={{ fontWeight: 500 }}>{row.nombre}</div>
                  <div style={{ fontSize: '0.75rem', color: '#8a9ab5', marginTop: '2px' }}>{row.email}</div>
                </td>
                <td style={TD_GRAY}>{row.academia}</td>
                <td style={TD_GRAY}>{capitalize(row.faja)}</td>
                <td style={TD_GRAY}>{capitalize(row.genero)}</td>
                <td style={TD_GRAY}>{row.division === 'nogi' ? 'No-Gi' : capitalize(row.division)}</td>
                <td style={TD_GRAY}>{capitalize(row.categoria)}</td>
                <td style={{ ...TD_GRAY, textAlign: 'right' }}>{row.peso_kg} kg</td>
                <td style={TD}>
                  <select
                    value={row.estado}
                    onChange={e => cambiarEstado(row.id, row.estado, e.target.value)}
                    disabled={changingState === row.id}
                    style={{
                      background:       'transparent',
                      border:           `1px solid ${
                        row.estado === 'confirmado' ? 'rgba(34,197,94,0.5)'  :
                        row.estado === 'presente'   ? 'rgba(59,130,246,0.5)' :
                        row.estado === 'retirado'   ? 'rgba(239,68,68,0.4)'  :
                        'rgba(245,158,11,0.4)'
                      }`,
                      color:            row.estado === 'confirmado' ? '#22c55e'  :
                                        row.estado === 'presente'   ? '#3b82f6'  :
                                        row.estado === 'retirado'   ? '#ef4444'  :
                                        '#f59e0b',
                      fontFamily:       'var(--font-barlow-condensed), sans-serif',
                      fontSize:         '0.72rem',
                      fontWeight:       700,
                      letterSpacing:    '1px',
                      textTransform:    'uppercase',
                      padding:          '5px 10px',
                      borderRadius:     '2px',
                      cursor:           changingState === row.id ? 'wait' : 'pointer',
                      opacity:          changingState === row.id ? 0.5 : 1,
                      appearance:       'none',
                      WebkitAppearance: 'none',
                    }}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="presente">Presente</option>
                    <option value="retirado">Retirado</option>
                  </select>
                </td>
                <td style={{ ...TD, textAlign: 'center' }}>
                  <button
                    onClick={() => togglePagado(row.id, row.pagado)}
                    disabled={toggling === row.id}
                    style={{
                      background:    row.pagado ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
                      border:        `1px solid ${row.pagado ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.4)'}`,
                      color:         row.pagado ? '#22c55e' : '#ef4444',
                      fontFamily:    'var(--font-barlow-condensed), sans-serif',
                      fontSize:      '0.72rem',
                      fontWeight:    700,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      padding:       '5px 12px',
                      borderRadius:  '2px',
                      cursor:        toggling === row.id ? 'wait' : 'pointer',
                      whiteSpace:    'nowrap',
                      opacity:       toggling === row.id ? 0.5 : 1,
                      transition:    'all 0.15s',
                    }}
                  >
                    {row.pagado ? '✓ Pagado' : 'Pendiente'}
                  </button>
                </td>
                <td style={{ ...TD, textAlign: 'center' }}>
                  {(row as any).comprobante_url ? (
                    <button
                      onClick={() => setCompModal({
                        id:        row.id,
                        nombre:    row.nombre,
                        academia:  row.academia,
                        faja:      row.faja ?? null,
                        categoria: row.categoria,
                        peso_kg:   row.peso_kg,
                        estado:    row.estado,
                        pagado:    row.pagado,
                        url:       (row as any).comprobante_url,
                      })}
                      title="Ver comprobante"
                      style={{
                        background: 'rgba(34,197,94,0.1)',
                        border:     '1px solid rgba(34,197,94,0.4)',
                        color:      '#22c55e',
                        borderRadius: '2px',
                        cursor:     'pointer',
                        padding:    '4px 10px',
                        fontSize:   '0.8rem',
                        fontFamily: 'var(--font-barlow-condensed), sans-serif',
                        fontWeight: 700,
                        letterSpacing: '1px',
                      }}
                    >
                      VER
                    </button>
                  ) : (
                    <span style={{ color: '#4a5a70', fontSize: '0.75rem' }}>—</span>
                  )}
                </td>
                <td style={TD_GRAY}>
                  {row.telefono ? (
                    <a
                      href={`https://wa.me/${row.telefono.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#22c55e', textDecoration: 'none', fontFamily: 'var(--font-barlow), sans-serif', fontSize: '0.85rem' }}
                      title="Abrir WhatsApp"
                    >
                      {row.telefono}
                    </a>
                  ) : '—'}
                </td>
                <td style={TD_GRAY}>{formatDate(row.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Modal comprobante ── */}
      {compModal && (
        <div
          onClick={() => setCompModal(null)}
          style={{
            position:   'fixed',
            inset:      0,
            background: 'rgba(5,8,16,0.92)',
            zIndex:     1000,
            display:    'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding:    '24px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background:   '#071428',
              border:       '1px solid rgba(42,107,194,0.3)',
              borderRadius: '4px',
              width:        '100%',
              maxWidth:     '820px',
              maxHeight:    '90vh',
              overflow:     'auto',
              display:      'flex',
              flexDirection:'column',
              gap:          0,
            }}
          >
            {/* Header del modal */}
            <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid rgba(42,107,194,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.65rem', letterSpacing: '4px', textTransform: 'uppercase', color: '#c9a227', marginBottom: '4px' }}>
                  Comprobante de pago
                </div>
                <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: '1.6rem', letterSpacing: '2px', color: '#f0f4ff' }}>
                  {compModal.nombre}
                </div>
                <div style={{ fontFamily: 'var(--font-barlow), sans-serif', fontSize: '0.85rem', color: '#8a9ab5', marginTop: '2px' }}>
                  {compModal.academia} · {capitalize(compModal.faja)} · {capitalize(compModal.categoria)} · {compModal.peso_kg} kg
                </div>
              </div>
              <button
                onClick={() => setCompModal(null)}
                style={{ background: 'transparent', border: 'none', color: '#8a9ab5', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1, padding: '4px 8px' }}
              >
                ✕
              </button>
            </div>

            {/* Imagen del comprobante */}
            <div style={{ padding: '20px 28px', flex: 1 }}>
              {compModal.url.match(/\.(pdf)$/i) ? (
                <iframe
                  src={compModal.url}
                  style={{ width: '100%', height: '500px', border: 'none', borderRadius: '2px' }}
                  title="Comprobante PDF"
                />
              ) : (
                <img
                  src={compModal.url}
                  alt="Comprobante de pago"
                  style={{ width: '100%', maxHeight: '480px', objectFit: 'contain', borderRadius: '2px', background: '#0d2144' }}
                />
              )}
            </div>

            {/* Acciones */}
            <div style={{ padding: '20px 28px', borderTop: '1px solid rgba(42,107,194,0.15)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              {compModal.pagado ? (
                <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.85rem', color: '#22c55e', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ✓ Pago ya confirmado
                </div>
              ) : (
                <>
                  <button
                    onClick={() => rechazarPago(compModal.id)}
                    style={{
                      ...BTN_BASE,
                      borderColor: 'rgba(239,68,68,0.4)',
                      color:       '#ef4444',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    ✕ Rechazar
                  </button>
                  <button
                    onClick={() => confirmarPago(compModal.id)}
                    disabled={confirming}
                    style={{
                      ...BTN_BASE,
                      background:  confirming ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.12)',
                      border:      '1px solid rgba(34,197,94,0.6)',
                      color:       '#22c55e',
                      opacity:     confirming ? 0.7 : 1,
                      cursor:      confirming ? 'wait' : 'pointer',
                    }}
                    onMouseEnter={e => { if (!confirming) e.currentTarget.style.background = 'rgba(34,197,94,0.2)' }}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(34,197,94,0.12)')}
                  >
                    {confirming ? '⟳ CONFIRMANDO...' : '✓ CONFIRMAR PAGO'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
