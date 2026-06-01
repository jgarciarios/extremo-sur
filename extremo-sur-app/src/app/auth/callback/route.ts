import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Supabase redirige acá después del link de reset/confirmación de email.
// Canjea el `code` PKCE por una sesión y redirige al destino.

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/perfil'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Si el next es explícito (reset-password, etc), respetar
      if (searchParams.get('next')) {
        return NextResponse.redirect(`${origin}${next}`)
      }
      // Si viene de OAuth (Google), verificar rol y redirigir según corresponda
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles').select('rol').eq('id', user.id).single()
        if (profile?.rol === 'admin' || profile?.rol === 'superadmin') {
          return NextResponse.redirect(`${origin}/admin`)
        }
        if (profile?.rol === 'llamador') {
          return NextResponse.redirect(`${origin}/llamador`)
        }
      }
      return NextResponse.redirect(`${origin}/perfil`)
    }
  }

  // Si algo falla, manda al login
  return NextResponse.redirect(`${origin}/login?error=link_invalido`)
}
