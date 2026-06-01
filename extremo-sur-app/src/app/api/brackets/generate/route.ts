import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { agruparEnCategorias } from '@/lib/brackets'

// Service role client para writes
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {

  // ── Auth: solo admin/superadmin ────────────────────────────────────────────
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('rol').eq('id', user.id).single()

  if (!['admin', 'superadmin'].includes(profile?.rol ?? '')) {
    return NextResponse.json({ error: 'Sin acceso' }, { status: 403 })
  }

  // ── Obtener evento_id ──────────────────────────────────────────────────────
  const { evento_id } = await req.json()
  if (!evento_id) return NextResponse.json({ error: 'evento_id requerido' }, { status: 400 })

  // ── Inscriptos confirmados (pagado = true) ─────────────────────────────────
  const { data: inscriptos, error: insErr } = await supabaseAdmin
    .from('inscripciones')
    .select('id, nombre, academia, faja, division, categoria, genero, peso_kg')
    .eq('evento_id', evento_id)
    .eq('pagado', true)

  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })
  if (!inscriptos?.length) {
    return NextResponse.json({ error: 'No hay inscriptos con pago confirmado' }, { status: 400 })
  }

  // ── Generar categorías y peleas ────────────────────────────────────────────
  const categorias = agruparEnCategorias(inscriptos)

  // ── Limpiar brackets anteriores para este evento ───────────────────────────
  await supabaseAdmin
    .from('categorias_bracket')
    .delete()
    .eq('evento_id', evento_id)

  // ── Insertar categorías y sus peleas ───────────────────────────────────────
  let totalPeleas = 0
  let totalCategorias = 0

  for (const cat of categorias) {
    // Insertar categoría
    const { data: catData, error: catErr } = await supabaseAdmin
      .from('categorias_bracket')
      .insert({
        evento_id,
        division:       cat.division,
        faja:           cat.faja,
        categoria:      cat.categoria,
        genero:         cat.genero,
        categoria_peso: cat.categoria_peso,
        num_rondas:     cat.num_rondas,
      })
      .select('id')
      .single()

    if (catErr || !catData) continue

    // Si hay menos de 2 competidores, solo registrar la categoría (ganador automático)
    if (cat.peleas.length === 0) {
      totalCategorias++
      continue
    }

    // Insertar peleas
    const { error: peleasErr } = await supabaseAdmin
      .from('peleas')
      .insert(
        cat.peleas.map(p => ({
          categoria_id:    catData.id,
          ronda:           p.ronda,
          orden:           p.orden,
          competidor_1_id: p.competidor_1_id,
          competidor_2_id: p.competidor_2_id,
          es_bye:          p.es_bye,
          ganador_id:      p.ganador_id,
          estado:          p.es_bye ? 'finalizado' : 'pendiente',
        }))
      )

    if (!peleasErr) {
      totalCategorias++
      totalPeleas += cat.peleas.length
    }
  }

  return NextResponse.json({
    ok:          true,
    categorias:  totalCategorias,
    peleas:      totalPeleas,
    inscriptos:  inscriptos.length,
  })
}
