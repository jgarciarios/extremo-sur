import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ─── Supabase admin client (service_role — nunca sale del servidor) ───────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── Rate limit config ────────────────────────────────────────────────────────

const RATE_LIMIT  = 3              // máx intentos por ventana
const WINDOW_MS   = 60 * 60 * 1000 // 1 hora en ms

// ─── Enums válidos ────────────────────────────────────────────────────────────

const FAJAS      = ['blanca', 'azul', 'morada', 'marron', 'negra']
const DIVISIONES = ['gi', 'nogi', 'ambas']
const CATEGORIAS = ['kids', 'juvenil', 'adulto', 'master', 'absoluto']
const GENEROS    = ['masculino', 'femenino']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitize(val: unknown, maxLen = 200): string {
  if (typeof val !== 'string') return ''
  return val.trim().slice(0, maxLen)
}

function validateBody(b: Record<string, unknown>): string | null {
  if (!sanitize(b.nombre))    return 'Nombre requerido'
  if (!sanitize(b.documento)) return 'Documento requerido'

  const email = sanitize(b.email)
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email inválido'

  if (!sanitize(b.telefono))  return 'Teléfono requerido'
  if (!sanitize(b.academia))  return 'Academia requerida'
  if (!sanitize(b.ciudad))    return 'Ciudad requerida'

  if (!FAJAS.includes(b.faja as string))           return 'Faixa inválida'
  if (!DIVISIONES.includes(b.division as string))  return 'División inválida'
  if (!CATEGORIAS.includes(b.categoria as string)) return 'Categoría inválida'
  if (!GENEROS.includes(b.genero as string))       return 'Género inválido'

  const peso = Number(b.peso_kg)
  if (isNaN(peso) || peso < 1 || peso > 1000) return 'Peso inválido'

  return null
}

// ─── POST /api/inscripcion ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {

  // ── 1. Rate limit por IP ───────────────────────────────────────────────────

  const ip = (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )

  const windowStart = new Date(Date.now() - WINDOW_MS).toISOString()

  const { count } = await supabase
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('created_at', windowStart)

  if ((count ?? 0) >= RATE_LIMIT) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Esperá una hora e intentá de nuevo.' },
      { status: 429 }
    )
  }

  // ── 2. Parse body ──────────────────────────────────────────────────────────

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Request inválido.' }, { status: 400 })
  }

  // ── 3. Honeypot anti-bot ───────────────────────────────────────────────────
  // Campo _trap siempre viene vacío en un humano.
  // Si tiene valor, es un bot — aceptamos silenciosamente sin insertar.

  if (body._trap) {
    return NextResponse.json({ ok: true })
  }

  // ── 4. Validación server-side ──────────────────────────────────────────────

  const validationError = validateBody(body)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  // ── 5. Obtener evento activo ───────────────────────────────────────────────

  const { data: eventos, error: eventoErr } = await supabase
    .from('eventos')
    .select('id')
    .eq('activo', true)
    .order('fecha', { ascending: true })
    .limit(1)

  if (eventoErr || !eventos?.length) {
    return NextResponse.json(
      { error: 'No hay eventos activos en este momento.' },
      { status: 400 }
    )
  }

  // ── 6. Insert inscripcion ──────────────────────────────────────────────────

  const { error: insertErr } = await supabase.from('inscripciones').insert({
    evento_id: eventos[0].id,
    nombre:    sanitize(body.nombre),
    documento: sanitize(body.documento),
    email:     sanitize(body.email).toLowerCase(),
    telefono:  sanitize(body.telefono),
    academia:  sanitize(body.academia),
    ciudad:    sanitize(body.ciudad),
    faja:      body.faja as string,
    division:  body.division as string,
    categoria: body.categoria as string,
    peso_kg:   Number(body.peso_kg),
    genero:    body.genero as string,
  })

  if (insertErr) {
    console.error('[inscripcion] insert error:', insertErr.message)
    return NextResponse.json(
      { error: 'Error al guardar la inscripción. Intentá de nuevo.' },
      { status: 500 }
    )
  }

  // ── 7. Registrar intento para rate limiting ────────────────────────────────

  await supabase.from('rate_limits').insert({ ip })

  // ── 8. Limpiar entradas viejas (> 2h) para mantener tabla chica ───────────

  const cleanup = new Date(Date.now() - 2 * WINDOW_MS).toISOString()
  await supabase.from('rate_limits').delete().lt('created_at', cleanup)

  return NextResponse.json({ ok: true })
}
