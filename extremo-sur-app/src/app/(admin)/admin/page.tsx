import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { InscriptosTable } from '@/components/InscriptosTable'
import type { Inscripcion } from '@/lib/types'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (profile?.rol !== 'admin') redirect('/')

  const { data } = await supabase
    .from('inscripciones')
    .select('id, nombre, documento, email, telefono, academia, ciudad, faja, genero, division, categoria, peso_kg, estado, pagado, created_at')
    .order('created_at', { ascending: false })

  return <InscriptosTable inscripciones={(data ?? []) as Inscripcion[]} />
}
