import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {

  // ── Auth: admin o llamador ─────────────────────────────────────────────────
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('rol').eq('id', user.id).single()

  if (!['admin', 'superadmin', 'llamador'].includes(profile?.rol ?? '')) {
    return NextResponse.json({ error: 'Sin acceso' }, { status: 403 })
  }

  const { pelea_id, ganador_id } = await req.json()
  if (!pelea_id || !ganador_id) {
    return NextResponse.json({ error: 'pelea_id y ganador_id son requeridos' }, { status: 400 })
  }

  // ── Obtener la pelea ───────────────────────────────────────────────────────
  const { data: pelea, error: peErr } = await supabaseAdmin
    .from('peleas')
    .select('id, categoria_id, ronda, orden, competidor_1_id, competidor_2_id, estado')
    .eq('id', pelea_id)
    .single()

  if (peErr || !pelea) {
    return NextResponse.json({ error: 'Pelea no encontrada' }, { status: 404 })
  }

  if (pelea.estado === 'finalizado') {
    return NextResponse.json({ error: 'Esta pelea ya fue finalizada' }, { status: 400 })
  }

  // Validar que el ganador sea uno de los competidores
  if (ganador_id !== pelea.competidor_1_id && ganador_id !== pelea.competidor_2_id) {
    return NextResponse.json({ error: 'El ganador no es un competidor de esta pelea' }, { status: 400 })
  }

  // ── Actualizar pelea actual ────────────────────────────────────────────────
  await supabaseAdmin
    .from('peleas')
    .update({ ganador_id, estado: 'finalizado' })
    .eq('id', pelea_id)

  // ── Avanzar ganador a la siguiente ronda ───────────────────────────────────
  // Ronda siguiente = ronda + 1
  // Posición en la siguiente ronda = floor(orden / 2)
  // Si orden es par → competidor_1_id; si es impar → competidor_2_id

  const siguienteRonda = pelea.ronda + 1
  const siguienteOrden = Math.floor(pelea.orden / 2)
  const esPrimerSlot   = pelea.orden % 2 === 0

  const { data: siguientePelea } = await supabaseAdmin
    .from('peleas')
    .select('id, competidor_1_id, competidor_2_id')
    .eq('categoria_id', pelea.categoria_id)
    .eq('ronda', siguienteRonda)
    .eq('orden', siguienteOrden)
    .single()

  if (siguientePelea) {
    const updateField = esPrimerSlot ? 'competidor_1_id' : 'competidor_2_id'
    await supabaseAdmin
      .from('peleas')
      .update({ [updateField]: ganador_id })
      .eq('id', siguientePelea.id)

    // Si la siguiente pelea ya tiene los dos competidores, la pone en curso
    const updatedC1 = esPrimerSlot ? ganador_id : siguientePelea.competidor_1_id
    const updatedC2 = esPrimerSlot ? siguientePelea.competidor_2_id : ganador_id
    if (updatedC1 && updatedC2) {
      await supabaseAdmin
        .from('peleas')
        .update({ estado: 'pendiente' })
        .eq('id', siguientePelea.id)
    }
  } else {
    // No hay siguiente pelea → es el ganador del torneo en esta categoría
    await supabaseAdmin
      .from('categorias_bracket')
      .update({ estado: 'finalizado' })
      .eq('id', pelea.categoria_id)
  }

  return NextResponse.json({ ok: true, ganador_id, siguiente_ronda: siguienteRonda })
}
