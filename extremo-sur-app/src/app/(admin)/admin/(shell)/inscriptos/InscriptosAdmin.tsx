'use client'

import { useState, useMemo } from 'react'

interface Inscripcion {
  id: string
  nombre: string
  email: string
  telefono?: string
  documento?: string
  academia?: string
  ciudad?: string
  faja?: string
  genero?: string
  division?: string
  categoria?: string
  peso_kg?: number
  estado?: string
  pagado?: boolean
  comprobante_url?: string
  created_at: string
  evento_id?: string
}

interface Props {
  inscripciones: Inscripcion[]
}

export function InscriptosAdmin({ inscripciones }: Props) {
  const [search,    setSearch]    = useState('')
  const [filDiv,    setFilDiv]    = useState('')
  const [filFaja,   setFilFaja]   = useState('')
  const [filPagado, setFilPagado] = useState('')
  const [filEstado, setFilEstado] = useState('')
  const [selected,  setSelected]  = useState<Inscripcion | null>(null)

  const divisiones = useMemo(() =>
    [...new Set(inscripciones.map(i => i.division).filter(Boolean))].sort(),
  [inscripciones])

  const fajas = useMemo(() =>
    [...new Set(inscripciones.map(i => i.faja).filter(Boolean))].sort(),
  [inscripciones])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return inscripciones.filter(i => {
      if (q && !`${i.nombre} ${i.email} ${i.academia} ${i.documento}`.toLowerCase().includes(q)) return false
      if (filDiv    && i.division !== filDiv)                       return false
      if (filFaja   && i.faja !== filFaja)                          return false
      if (filPagado === 'si'  && !i.pagado)                         return false
      if (filPagado === 'no'  && i.pagado)                          return false
      if (filEstado && i.estado !== filEstado)                      return false
      return true
    })
  }, [inscripciones, search, filDiv, filFaja, filPagado, filEstado])

  function fmt(d: string) {
    return new Date(d).toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: '2-digit' })
  }

  return (
    <>
      {/* Filtros */}
      <div className="adm-filters">
        <input
          className="adm-input"
          placeholder="Buscar nombre, email, documento..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ minWidth: 240 }}
        />
        <select className="adm-input adm-select" value={filDiv} onChange={e => setFilDiv(e.target.value)}>
          <option value="">Todas las divisiones</option>
          {divisiones.map(d => <option key={d} value={d!}>{d}</option>)}
        </select>
        <select className="adm-input adm-select" value={filFaja} onChange={e => setFilFaja(e.target.value)}>
          <option value="">Todas las fajas</option>
          {fajas.map(f => <option key={f} value={f!} style={{ textTransform: 'capitalize' }}>{f}</option>)}
        </select>
        <select className="adm-input adm-select" value={filPagado} onChange={e => setFilPagado(e.target.value)}>
          <option value="">Todos los pagos</option>
          <option value="si">Pagados</option>
          <option value="no">Pendientes</option>
        </select>
        <select className="adm-input adm-select" value={filEstado} onChange={e => setFilEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="confirmado">Confirmado</option>
          <option value="rechazado">Rechazado</option>
        </select>
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--adm-muted)' }}>
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tabla */}
      <div className="adm-card">
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Academia</th>
                <th>División</th>
                <th>Faja</th>
                <th>Peso</th>
                <th>Género</th>
                <th>Estado</th>
                <th>Pago</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={11} style={{ textAlign: 'center', color: 'var(--adm-muted)', padding: 40 }}>Sin resultados</td></tr>
              ) : filtered.map(i => (
                <tr key={i.id}>
                  <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{i.nombre}</td>
                  <td style={{ color: 'var(--adm-muted)', fontFamily: 'monospace', fontSize: '0.75rem' }}>{i.documento ?? '—'}</td>
                  <td style={{ color: 'var(--adm-muted)' }}>{i.academia ?? '—'}</td>
                  <td>{i.division ?? '—'}</td>
                  <td style={{ textTransform: 'capitalize' }}>{i.faja ?? '—'}</td>
                  <td>{i.peso_kg ? `${i.peso_kg} kg` : '—'}</td>
                  <td style={{ textTransform: 'capitalize' }}>{i.genero ?? '—'}</td>
                  <td>
                    <span className={`adm-badge ${i.estado === 'confirmado' ? 'green' : i.estado === 'rechazado' ? 'red' : 'yellow'}`}>
                      {i.estado ?? 'pendiente'}
                    </span>
                  </td>
                  <td>
                    <span className={`adm-badge ${i.pagado ? 'green' : 'yellow'}`}>
                      {i.pagado ? 'Pagado' : 'Pendiente'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--adm-muted)', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>{fmt(i.created_at)}</td>
                  <td>
                    <button
                      className="adm-btn ghost"
                      style={{ padding: '4px 10px', fontSize: '0.65rem' }}
                      onClick={() => setSelected(i)}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal detalle */}
      {selected && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}
        >
          <div style={{ background: 'var(--adm-surface)', border: '1px solid var(--adm-border)', borderRadius: 2, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--adm-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, letterSpacing: 2, fontSize: '0.9rem', textTransform: 'uppercase' }}>
                Detalle inscripción
              </span>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--adm-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              <Row label="Nombre"     value={selected.nombre} />
              <Row label="Email"      value={selected.email} />
              <Row label="Teléfono"   value={selected.telefono ?? '—'} />
              <Row label="Documento"  value={selected.documento ?? '—'} />
              <Row label="Academia"   value={selected.academia ?? '—'} />
              <Row label="Ciudad"     value={selected.ciudad ?? '—'} />
              <Row label="División"   value={selected.division ?? '—'} />
              <Row label="Categoría"  value={selected.categoria ?? '—'} />
              <Row label="Faja"       value={selected.faja ?? '—'} />
              <Row label="Peso"       value={selected.peso_kg ? `${selected.peso_kg} kg` : '—'} />
              <Row label="Género"     value={selected.genero ?? '—'} />
              <Row label="Estado"     value={selected.estado ?? 'pendiente'} />
              <Row label="Pago"       value={selected.pagado ? 'Confirmado' : 'Pendiente'} />
              <Row label="Fecha"      value={new Date(selected.created_at).toLocaleString('es-UY')} />
              {selected.comprobante_url && (
                <div style={{ marginTop: 16 }}>
                  <a href={selected.comprobante_url} target="_blank" rel="noopener" className="adm-btn primary">
                    Ver comprobante →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 10, fontSize: '0.82rem' }}>
      <span style={{ width: 110, flexShrink: 0, color: 'var(--adm-muted)', fontWeight: 600, fontSize: '0.72rem', letterSpacing: 1, textTransform: 'uppercase' }}>{label}</span>
      <span style={{ textTransform: label === 'Faja' || label === 'Género' ? 'capitalize' : 'none' }}>{value}</span>
    </div>
  )
}
