import { createClient } from '@/lib/supabase/server'
import { UsuariosAdmin } from './UsuariosAdmin'

export const dynamic = 'force-dynamic'

export default async function UsuariosPage() {
  const supabase = await createClient()

  const { data: admins } = await supabase
    .from('profiles')
    .select('id, nombre, rol')
    .in('rol', ['admin', 'superadmin'])
    .order('rol')

  return (
    <>
      <div className="adm-topbar">
        <span className="adm-topbar-title">Usuarios</span>
        <span className="adm-topbar-sep">·</span>
        <span className="adm-topbar-sub">{admins?.length ?? 0} administradores</span>
      </div>
      <div className="adm-main">
        <UsuariosAdmin admins={admins ?? []} />
      </div>
    </>
  )
}
