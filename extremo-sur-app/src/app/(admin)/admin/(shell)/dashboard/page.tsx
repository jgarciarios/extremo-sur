import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: inscripciones = [] } = await supabase
    .from('inscripciones')
    .select('id, estado, pagado, academia, division, categoria, faja, genero, created_at, evento_id')
    .order('created_at', { ascending: false })

  const all    = inscripciones ?? []
  const total  = all.length
  const pagados   = all.filter(i => i.pagado).length
  const pendientes = all.filter(i => !i.pagado && i.estado !== 'rechazado').length
  const rechazados = all.filter(i => i.estado === 'rechazado').length

  // Por división
  const divCount: Record<string, number> = {}
  all.forEach(i => {
    const d = i.division ?? 'Sin especificar'
    divCount[d] = (divCount[d] ?? 0) + 1
  })
  const divSorted = Object.entries(divCount).sort((a, b) => b[1] - a[1])

  // Por faja
  const fajaCount: Record<string, number> = {}
  all.forEach(i => {
    const f = i.faja ?? 'Sin especificar'
    fajaCount[f] = (fajaCount[f] ?? 0) + 1
  })
  const fajaSorted = Object.entries(fajaCount).sort((a, b) => b[1] - a[1])

  // Top academias
  const acaCount: Record<string, number> = {}
  all.forEach(i => {
    const a = i.academia?.trim() || 'Sin academia'
    acaCount[a] = (acaCount[a] ?? 0) + 1
  })
  const acaSorted = Object.entries(acaCount).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const maxAca = acaSorted[0]?.[1] ?? 1

  // Últimas inscripciones (ya vienen ordenadas)
  const recientes = all.slice(0, 8)

  // Por género
  const mCount = all.filter(i => i.genero === 'masculino').length
  const fCount = all.filter(i => i.genero === 'femenino').length

  return (
    <>
      <div className="adm-topbar">
        <span className="adm-topbar-title">Dashboard</span>
        <span className="adm-topbar-sep">·</span>
        <span className="adm-topbar-sub">Resumen general del torneo</span>
      </div>

      <div className="adm-main">

        {/* KPIs principales */}
        <div className="adm-kpi-grid">
          <div className="adm-kpi gold">
            <div className="adm-kpi-label">Total inscriptos</div>
            <div className="adm-kpi-value">{total}</div>
            <div className="adm-kpi-sub">Todas las etapas</div>
          </div>
          <div className="adm-kpi green">
            <div className="adm-kpi-label">Pagos confirmados</div>
            <div className="adm-kpi-value">{pagados}</div>
            <div className="adm-kpi-sub">{total > 0 ? Math.round(pagados / total * 100) : 0}% del total</div>
          </div>
          <div className="adm-kpi yellow">
            <div className="adm-kpi-label">Pendientes de pago</div>
            <div className="adm-kpi-value">{pendientes}</div>
            <div className="adm-kpi-sub">Sin confirmar</div>
          </div>
          <div className="adm-kpi red">
            <div className="adm-kpi-label">Rechazados</div>
            <div className="adm-kpi-value">{rechazados}</div>
            <div className="adm-kpi-sub">Comprobante inválido</div>
          </div>
          <div className="adm-kpi blue">
            <div className="adm-kpi-label">Masculino</div>
            <div className="adm-kpi-value">{mCount}</div>
            <div className="adm-kpi-sub">{total > 0 ? Math.round(mCount / total * 100) : 0}%</div>
          </div>
          <div className="adm-kpi">
            <div className="adm-kpi-label">Femenino</div>
            <div className="adm-kpi-value">{fCount}</div>
            <div className="adm-kpi-sub">{total > 0 ? Math.round(fCount / total * 100) : 0}%</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>

          {/* Top academias */}
          <div className="adm-card">
            <div className="adm-card-header">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              <span className="adm-card-title">Top Academias</span>
            </div>
            <div className="adm-card-body">
              {acaSorted.length === 0 ? (
                <div className="adm-empty">Sin datos</div>
              ) : acaSorted.map(([name, count]) => (
                <div className="adm-bar-row" key={name}>
                  <div className="adm-bar-label" title={name}>{name}</div>
                  <div className="adm-bar-track">
                    <div className="adm-bar-fill" style={{ width: `${count / maxAca * 100}%` }} />
                  </div>
                  <div className="adm-bar-count">{count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Por división */}
          <div className="adm-card">
            <div className="adm-card-header">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2" strokeLinecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              <span className="adm-card-title">Por División</span>
            </div>
            <div className="adm-card-body">
              {divSorted.length === 0 ? (
                <div className="adm-empty">Sin datos</div>
              ) : divSorted.map(([name, count]) => (
                <div className="adm-bar-row" key={name}>
                  <div className="adm-bar-label">{name}</div>
                  <div className="adm-bar-track">
                    <div className="adm-bar-fill" style={{ width: `${count / (divSorted[0]?.[1] ?? 1) * 100}%` }} />
                  </div>
                  <div className="adm-bar-count">{count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Por faja */}
          <div className="adm-card">
            <div className="adm-card-header">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2" strokeLinecap="round"><rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/></svg>
              <span className="adm-card-title">Por Faixa</span>
            </div>
            <div className="adm-card-body">
              {fajaSorted.length === 0 ? (
                <div className="adm-empty">Sin datos</div>
              ) : fajaSorted.map(([name, count]) => (
                <div className="adm-bar-row" key={name}>
                  <div className="adm-bar-label" style={{ textTransform: 'capitalize' }}>{name}</div>
                  <div className="adm-bar-track">
                    <div className="adm-bar-fill" style={{ width: `${count / (fajaSorted[0]?.[1] ?? 1) * 100}%` }} />
                  </div>
                  <div className="adm-bar-count">{count}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Últimas inscripciones */}
        <div className="adm-card" style={{ marginTop: 20 }}>
          <div className="adm-card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span className="adm-card-title">Últimas Inscripciones</span>
            </div>
            <a href="/admin/inscriptos" className="adm-btn ghost" style={{ fontSize: '0.65rem' }}>Ver todas →</a>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Academia</th>
                  <th>División</th>
                  <th>Faixa</th>
                  <th>Estado</th>
                  <th>Pago</th>
                </tr>
              </thead>
              <tbody>
                {recientes.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--adm-muted)', padding: 40 }}>Sin inscripciones</td></tr>
                ) : recientes.map((i: Record<string, unknown>) => (
                  <tr key={i.id as string}>
                    <td style={{ fontWeight: 600 }}>{i.nombre as string ?? '—'}</td>
                    <td style={{ color: 'var(--adm-muted)' }}>{i.academia as string ?? '—'}</td>
                    <td>{i.division as string ?? '—'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{i.faja as string ?? '—'}</td>
                    <td>
                      <span className={`adm-badge ${i.estado === 'confirmado' ? 'green' : i.estado === 'rechazado' ? 'red' : 'yellow'}`}>
                        {i.estado as string ?? 'pendiente'}
                      </span>
                    </td>
                    <td>
                      <span className={`adm-badge ${i.pagado ? 'green' : 'yellow'}`}>
                        {i.pagado ? 'Pagado' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  )
}
