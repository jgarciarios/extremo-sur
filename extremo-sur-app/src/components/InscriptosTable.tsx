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

export function InscriptosTable({ inscripciones }: { inscripciones: Inscripcion[] }) {
  const router = useRouter()
  const [rows,     setRows]     = useState<Inscripcion[]>(inscripciones)
  const [toggling, setToggling] = useState<string | null>(null)

  // Filters
  const [search,     setSearch]     = useState('')
  const [filterFaja, setFilterFaja] = useState('')
  const [filterPago, setFilterPago] = useState('')

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

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  // ── Filtered rows ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return rows.filter(r => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        r.nombre.toLowerCase().includes(q) ||
        r.academia.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.ciudad ?? '').toLowerCase().includes(q)
      const matchFaja = !filterFaja || r.faja === filterFaja
      const matchPago =
        filterPago === ''        ? true :
        filterPago === 'pagado'  ? r.pagado :
        /* pendiente */            !r.pagado
      return matchSearch && matchFaja && matchPago
    })
  }, [rows, search, filterFaja, filterPago])

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
          placeholder="Buscar nombre, academia, email..."
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
          <select value={filterPago} onChange={e => setFilterPago(e.target.value)} style={SELECT_FILTER}>
            <option value="">Todos</option>
            <option value="pagado">Pagado</option>
            <option value="pendiente">Pendiente</option>
          </select>
          <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#8a9ab5', pointerEvents: 'none', fontSize: '0.7rem' }}>▼</span>
        </div>
        {(search || filterFaja || filterPago) && (
          <button
            onClick={() => { setSearch(''); setFilterFaja(''); setFilterPago('') }}
            style={{ ...BTN_BASE, padding: '8px 14px', fontSize: '0.72rem', borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            ✕ Limpiar
          </button>
        )}
        {(search || filterFaja || filterPago) && (
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
              <th style={TH}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} style={{ ...TD, textAlign: 'center', color: '#8a9ab5', padding: '40px' }}>
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
                <td style={TD_GRAY}>{capitalize(row.estado)}</td>
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
                <td style={TD_GRAY}>{formatDate(row.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
