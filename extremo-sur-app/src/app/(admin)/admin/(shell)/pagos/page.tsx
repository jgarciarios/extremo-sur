import { createClient } from '@/lib/supabase/server'
import { PagosAdmin } from './PagosAdmin'

export const dynamic = 'force-dynamic'

export default async function PagosPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('inscripciones')
    .select('id, nombre, email, academia, division, faja, estado, pagado, comprobante_url, created_at')
    .not('comprobante_url', 'is', null)
    .order('created_at', { ascending: false })

  const pendientes = (data ?? []).filter(i => !i.pagado && i.estado !== 'rechazado').length

  return (
    <>
      <div className="adm-topbar">
        <span className="adm-topbar-title">Pagos</span>
        <span className="adm-topbar-sep">·</span>
        <span className="adm-topbar-sub">{pendientes} comprobante{pendientes !== 1 ? 's' : ''} por revisar</span>
      </div>
      <div className="adm-main">
        <PagosAdmin inscripciones={data ?? []} />
      </div>
    </>
  )
}
