import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AcademiasPage() {
  const supabase = await createClient()
  const { data: all = [] } = await supabase
    .from('inscripciones')
    .select('academia, ciudad, faja, genero, pagado, division')

  const rows = all ?? []

  // Agrupar por academia
  const map: Record<string, {
    total: number, pagados: number,
    fajas: Record<string, number>,
    generos: Record<string, number>,
    divisiones: Record<string, number>,
    ciudades: Set<string>,
  }> = {}

  rows.forEach(r => {
    const a = r.academia?.trim() || 'Sin academia'
    if (!map[a]) map[a] = { total: 0, pagados: 0, fajas: {}, generos: {}, divisiones: {}, ciudades: new Set() }
    map[a].total++
    if (r.pagado) map[a].pagados++
    if (r.faja) map[a].fajas[r.faja] = (map[a].fajas[r.faja] ?? 0) + 1
    if (r.genero) map[a].generos[r.genero] = (map[a].generos[r.genero] ?? 0) + 1
    if (r.division) map[a].divisiones[r.division] = (map[a].divisiones[r.division] ?? 0) + 1
    if (r.ciudad) map[a].ciudades.add(r.ciudad)
  })

  const academias = Object.entries(map).sort((a, b) => b[1].total - a[1].total)
  const maxTotal = academias[0]?.[1].total ?? 1

  return (
    <>
      <div className="adm-topbar">
        <span className="adm-topbar-title">Academias</span>
        <span className="adm-topbar-sep">·</span>
        <span className="adm-topbar-sub">{academias.length} academias · {rows.length} competidores</span>
      </div>
      <div className="adm-main">

        {/* Ranking visual */}
        <div className="adm-card" style={{ marginBottom: 20 }}>
          <div className="adm-card-header">
            <span className="adm-card-title">Ranking por cantidad de competidores</span>
          </div>
          <div className="adm-card-body">
            {academias.map(([name, data]) => (
              <div className="adm-bar-row" key={name}>
                <div className="adm-bar-label" title={name}>{name}</div>
                <div className="adm-bar-track">
                  <div className="adm-bar-fill" style={{ width: `${data.total / maxTotal * 100}%` }} />
                </div>
                <div className="adm-bar-count">{data.total}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabla detalle */}
        <div className="adm-card">
          <div className="adm-card-header">
            <span className="adm-card-title">Detalle por academia</span>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Academia</th>
                  <th>Ciudad(es)</th>
                  <th>Total</th>
                  <th>Pagados</th>
                  <th>Divisiones</th>
                  <th>Faixas</th>
                </tr>
              </thead>
              <tbody>
                {academias.map(([name, data], idx) => (
                  <tr key={name}>
                    <td style={{ color: 'var(--adm-muted)', fontFamily: 'monospace' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 700 }}>{name}</td>
                    <td style={{ color: 'var(--adm-muted)', fontSize: '0.75rem' }}>
                      {[...data.ciudades].join(', ') || '—'}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--adm-gold)' }}>{data.total}</td>
                    <td>
                      <span className={`adm-badge ${data.pagados === data.total ? 'green' : data.pagados > 0 ? 'yellow' : 'gray'}`}>
                        {data.pagados}/{data.total}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.72rem', color: 'var(--adm-muted)' }}>
                      {Object.entries(data.divisiones).sort((a, b) => b[1] - a[1]).map(([d, n]) => `${d} (${n})`).join(', ') || '—'}
                    </td>
                    <td style={{ fontSize: '0.72rem', color: 'var(--adm-muted)', textTransform: 'capitalize' }}>
                      {Object.entries(data.fajas).sort((a, b) => b[1] - a[1]).map(([f, n]) => `${f} (${n})`).join(', ') || '—'}
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
