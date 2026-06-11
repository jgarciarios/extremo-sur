'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Item {
  id: string
  nombre: string
  email: string
  academia?: string
  division?: string
  faja?: string
  estado?: string
  pagado?: boolean
  comprobante_url?: string
  created_at: string
}

interface Props { inscripciones: Item[] }

type Filter = 'pendientes' | 'confirmados' | 'rechazados' | 'todos'

export function PagosAdmin({ inscripciones: initial }: Props) {
  const [items, setItems] = useState(initial)
  const [filter, setFilter] = useState<Filter>('pendientes')
  const [loading, setLoading] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const filtered = items.filter(i => {
    if (filter === 'pendientes')  return !i.pagado && i.estado !== 'rechazado'
    if (filter === 'confirmados') return !!i.pagado
    if (filter === 'rechazados')  return i.estado === 'rechazado'
    return true
  })

  async function aprobar(id: string) {
    setLoading(id)
    const supabase = createClient()
    await supabase.from('inscripciones').update({ pagado: true, estado: 'confirmado' }).eq('id', id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, pagado: true, estado: 'confirmado' } : i))
    setLoading(null)
  }

  async function rechazar(id: string) {
    setLoading(id)
    const supabase = createClient()
    await supabase.from('inscripciones').update({ pagado: false, estado: 'rechazado' }).eq('id', id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, pagado: false, estado: 'rechazado' } : i))
    setLoading(null)
  }

  const counts = {
    pendientes:  items.filter(i => !i.pagado && i.estado !== 'rechazado').length,
    confirmados: items.filter(i => !!i.pagado).length,
    rechazados:  items.filter(i => i.estado === 'rechazado').length,
  }

  return (
    <>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {(['pendientes', 'confirmados', 'rechazados', 'todos'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              borderRadius: 2,
              border: filter === f ? 'none' : '1px solid var(--adm-border)',
              background: filter === f ? 'var(--adm-gold)' : 'transparent',
              color: filter === f ? '#07111f' : 'var(--adm-muted)',
              fontFamily: 'var(--font-barlow-condensed)',
              fontWeight: 700,
              fontSize: '0.72rem',
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            {f} {f !== 'todos' && `(${counts[f as keyof typeof counts]})`}
          </button>
        ))}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="adm-empty">No hay comprobantes en esta categoría</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(i => (
            <div key={i.id} className="adm-card">
              <div className="adm-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 2 }}>{i.nombre}</div>
                    <div style={{ color: 'var(--adm-muted)', fontSize: '0.72rem' }}>{i.email}</div>
                  </div>
                  <span className={`adm-badge ${i.pagado ? 'green' : i.estado === 'rechazado' ? 'red' : 'yellow'}`}>
                    {i.pagado ? 'Confirmado' : i.estado === 'rechazado' ? 'Rechazado' : 'Pendiente'}
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--adm-muted)', marginBottom: 14, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span>{i.academia ?? 'Sin academia'}</span>
                  <span>·</span>
                  <span>{i.division ?? '—'}</span>
                  <span>·</span>
                  <span style={{ textTransform: 'capitalize' }}>{i.faja ?? '—'}</span>
                </div>

                {/* Comprobante preview */}
                {i.comprobante_url && (
                  <div
                    onClick={() => setPreview(i.comprobante_url!)}
                    style={{
                      width: '100%', height: 160, background: '#0a1525',
                      border: '1px solid var(--adm-border)', borderRadius: 2,
                      overflow: 'hidden', cursor: 'pointer', marginBottom: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={i.comprobante_url}
                      alt="Comprobante"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.2s',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.4)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}
                    >
                      <span style={{ color: '#fff', fontSize: '0.7rem', letterSpacing: 1, fontWeight: 700 }}>VER COMPLETO</span>
                    </div>
                  </div>
                )}

                {/* Acciones */}
                {!i.pagado && i.estado !== 'rechazado' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="adm-btn success"
                      style={{ flex: 1 }}
                      disabled={loading === i.id}
                      onClick={() => aprobar(i.id)}
                    >
                      {loading === i.id ? '...' : '✓ Aprobar'}
                    </button>
                    <button
                      className="adm-btn danger"
                      style={{ flex: 1 }}
                      disabled={loading === i.id}
                      onClick={() => rechazar(i.id)}
                    >
                      {loading === i.id ? '...' : '✕ Rechazar'}
                    </button>
                  </div>
                )}
                {i.pagado && (
                  <button className="adm-btn danger" style={{ width: '100%' }} disabled={loading === i.id} onClick={() => rechazar(i.id)}>
                    Revertir aprobación
                  </button>
                )}
                {i.estado === 'rechazado' && (
                  <button className="adm-btn success" style={{ width: '100%' }} disabled={loading === i.id} onClick={() => aprobar(i.id)}>
                    Aprobar de todas formas
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, cursor: 'zoom-out' }}
        >
          <img src={preview} alt="Comprobante" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }} />
          <button onClick={() => setPreview(null)} style={{ position: 'fixed', top: 20, right: 24, background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}>✕</button>
        </div>
      )}
    </>
  )
}
