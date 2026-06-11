import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from './AdminSidebar'
import './admin.css'

export default async function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (profile?.rol !== 'admin' && profile?.rol !== 'superadmin') redirect('/')

  return (
    <div className="adm-shell">
      <AdminSidebar email={user.email ?? ''} />
      <div className="adm-content">
        {children}
      </div>
    </div>
  )
}
