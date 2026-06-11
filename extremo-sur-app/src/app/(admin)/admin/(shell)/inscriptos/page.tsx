import { createClient } from '@/lib/supabase/server'
import { InscriptosAdmin } from './InscriptosAdmin'

export const dynamic = 'force-dynamic'

export default async function InscriptosPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('inscripciones')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <>
      <div className="adm-topbar">
        <span className="adm-topbar-title">Inscriptos</span>
        <span className="adm-topbar-sep">·</span>
        <span className="adm-topbar-sub">{data?.length ?? 0} registros</span>
      </div>
      <div className="adm-main">
        <InscriptosAdmin inscripciones={data ?? []} />
      </div>
    </>
  )
}
