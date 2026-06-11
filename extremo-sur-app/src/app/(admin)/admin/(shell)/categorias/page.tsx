import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function CategoriasPage() {
  const supabase = await createClient()
  const { data: all = [] } = await supabase
    .from('inscripciones')
    .select('division, categoria, faja, peso_kg, genero, estado, pagado')

  const rows = all ?? []

  function count<T extends string>(key: keyof typeof rows[0]) {
    const map: Record<string, number> = {}
    rows.forEach(r => {
      const v = (r[key] as string) ?? 'Sin especificar'
      map[v] = (map[v] ?? 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1]) as [T, number][]
  }

  const divisiones  = count('division')
  const categorias  = count('categoria')
  const fajas       = count('faja')
  const generos     = count('genero')

  const maxDiv = divisiones[0]?.[1] ?? 1
  const maxCat = categorias[0]?.[1] ?? 1
  const maxFaj = fajas[0]?.[1] ?? 1

  return (
    <>
      <div className="adm-topbar">
        <span className="adm-topbar-title">Categorías</span>
        <span className="adm-topbar-sep">·</span>
        <span className="adm-topbar-sub">Distribución de competidores</span>
      </div>
      <div className="adm-main">

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>

          {/* Divisiones */}
          <div className="adm-card">
            <div className="adm-card-header">
              <span className="adm-card-title">Por División</span>
            </div>
            <div className="adm-card-body">
              {divisiones.map(([name, n]) => (
                <div className="adm-bar-row" key={name}>
                  <div className="adm-bar-label">{name}</div>
                  <div className="adm-bar-track"><div className="adm-bar-fill" style={{ width: `${n / maxDiv * 100}%` }} /></div>
                  <div className="adm-bar-count">{n}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Fajas */}
          <div className="adm-card">
            <div className="adm-card-header">
              <span className="adm-card-title">Por Faixa</span>
            </div>
            <div className="adm-card-body">
              {fajas.map(([name, n]) => (
                <div className="adm-bar-row" key={name}>
                  <div className="adm-bar-label" style={{ textTransform: 'capitalize' }}>{name}</div>
                  <div className="adm-bar-track"><div className="adm-bar-fill" style={{ width: `${n / maxFaj * 100}%` }} /></div>
                  <div className="adm-bar-count">{n}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Género */}
          <div className="adm-card">
            <div className="adm-card-header">
              <span className="adm-card-title">Por Género</span>
            </div>
            <div className="adm-card-body">
              {generos.map(([name, n]) => (
                <div className="adm-bar-row" key={name}>
                  <div className="adm-bar-label" style={{ textTransform: 'capitalize' }}>{name}</div>
                  <div className="adm-bar-track"><div className="adm-bar-fill" style={{ width: `${n / (generos[0]?.[1] ?? 1) * 100}%` }} /></div>
                  <div className="adm-bar-count">{n}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Categorías */}
          <div className="adm-card" style={{ gridColumn: '1 / -1' }}>
            <div className="adm-card-header">
              <span className="adm-card-title">Por Categoría de Peso</span>
            </div>
            <div className="adm-card-body">
              <div style={{ columns: 2, gap: 24 }}>
                {categorias.map(([name, n]) => (
                  <div className="adm-bar-row" key={name} style={{ breakInside: 'avoid' }}>
                    <div className="adm-bar-label">{name}</div>
                    <div className="adm-bar-track"><div className="adm-bar-fill" style={{ width: `${n / maxCat * 100}%` }} /></div>
                    <div className="adm-bar-count">{n}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
