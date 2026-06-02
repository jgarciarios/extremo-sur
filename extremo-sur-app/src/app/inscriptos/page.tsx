import { createClient } from '@/lib/supabase/server'
import { AtletasClient } from './AtletasClient'

export const revalidate = 60

export default async function InscriptosPage() {
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from('inscripciones')
    .select('id, nombre, academia, ciudad, faja, genero, division, categoria, peso_kg, estado')
    .order('nombre', { ascending: true })

  return <AtletasClient inscriptos={rows ?? []} />
}
