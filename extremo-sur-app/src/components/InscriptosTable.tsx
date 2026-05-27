'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Inscripcion } from '@/lib/types'

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
  fontFamily:  'var(--font-barlow), sans-serif',
  fontSize:    '0.875rem',
  color:       '#f0f4ff',
  padding:     '14px 16px',
  borderBottom:'1px solid rgba(42,107,194,0.1)',
  verticalAlign:'middle',
}

const TD_GRAY: React.CSSProperties = {
  ...TD,
  color: '#8a9ab5',
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function capitalize(s: string | null) {
  if (!s) return '—'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function InscriptosTable({ inscripciones }: { inscripciones: Inscripcion[] }) {
  const router = useRouter()
  const [rows, setRows] = useState<Inscripcion[]>(inscripciones)
  const [toggling, setToggling] = useState<string | null>(null)

  async function togglePagado(id: string, current: boolean) {
    setToggling(id)
    // Optimistic update
    setRows(prev => prev.map(r => r.id === id ? { ...r, pagado: !current } : r))

    const supabase = createClient()
    const { error } = await supabase
      .from('inscripciones')
      .update({ pagado: !current })
      .eq('id', id)

    if (error) {
      // Revert on failure
      setRows(prev => prev.map(r => r.id === id ? { ...r, pagado: current } : r))
    }
    setToggling(null)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050810', color: '#f0f4ff', padding: '40px 32px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '6px', textTransform: 'uppercase', color: '#c9a227', marginBottom: '8px' }}>
            Panel Administrativo
          </div>
          <h1 style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '4px', lineHeight: 1 }}>
            INSCRIPTOS
          </h1>
          <div style={{ fontFamily: 'var(--font-barlow), sans-serif', fontSize: '0.875rem', color: '#8a9ab5', marginTop: '6px' }}>
            {rows.length} registros · {rows.filter(r => r.pagado).length} pagados
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            background:   'transparent',
            border:       '1px solid rgba(201,162,39,0.4)',
            color:        '#c9a227',
            fontFamily:   'var(--font-barlow-condensed), sans-serif',
            fontSize:     '0.8rem',
            fontWeight:   700,
            letterSpacing:'2px',
            textTransform:'uppercase',
            padding:      '10px 20px',
            borderRadius: '2px',
            cursor:       'pointer',
            transition:   'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,162,39,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          Cerrar sesión
        </button>
      </div>

      {/* Table */}
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
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} style={{ ...TD, textAlign: 'center', color: '#8a9ab5', padding: '40px' }}>
                  Sin inscripciones aún.
                </td>
              </tr>
            )}
            {rows.map((row, i) => (
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
                      background:   row.pagado ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
                      border:       `1px solid ${row.pagado ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.4)'}`,
                      color:        row.pagado ? '#22c55e' : '#ef4444',
                      fontFamily:   'var(--font-barlow-condensed), sans-serif',
                      fontSize:     '0.72rem',
                      fontWeight:   700,
                      letterSpacing:'1px',
                      textTransform:'uppercase',
                      padding:      '5px 12px',
                      borderRadius: '2px',
                      cursor:       toggling === row.id ? 'wait' : 'pointer',
                      whiteSpace:   'nowrap',
                      opacity:      toggling === row.id ? 0.5 : 1,
                      transition:   'all 0.15s',
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
