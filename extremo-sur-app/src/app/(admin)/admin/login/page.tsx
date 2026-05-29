'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Status = 'idle' | 'submitting' | 'error' | 'reset-sent'

const BASE_INPUT: React.CSSProperties = {
  width:       '100%',
  background:  'rgba(13,33,68,0.8)',
  border:      '1px solid rgba(42,107,194,0.3)',
  borderRadius:'2px',
  color:       '#f0f4ff',
  fontFamily:  'var(--font-barlow), sans-serif',
  fontSize:    '1rem',
  padding:     '12px 16px',
  outline:     'none',
  transition:  'border-color 0.2s, box-shadow 0.2s',
}

const LABEL: React.CSSProperties = {
  display:      'block',
  fontFamily:   'var(--font-barlow-condensed), sans-serif',
  fontSize:     '0.72rem',
  fontWeight:   700,
  letterSpacing:'2px',
  textTransform:'uppercase',
  color:        '#8a9ab5',
  marginBottom: '6px',
}

export default function LoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [status,   setStatus]   = useState<Status>('idle')
  const [message,  setMessage]  = useState('')
  const [focused,  setFocused]  = useState<string | null>(null)

  function inputStyle(name: string): React.CSSProperties {
    return {
      ...BASE_INPUT,
      borderColor: status === 'error' ? '#ef4444'
                 : focused === name    ? '#c9a227'
                 : 'rgba(42,107,194,0.3)',
      boxShadow: focused === name && status !== 'error'
        ? '0 0 0 1px rgba(201,162,39,0.15)'
        : 'none',
    }
  }

  async function handleReset() {
    if (!email.trim()) {
      setMessage('Ingresá tu email para recuperar la contraseña.')
      setStatus('error')
      return
    }
    setStatus('submitting')
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    })
    // Siempre mostrar éxito (no revelar si el email existe o no)
    setStatus('reset-sent')
    setMessage('')
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!email.trim() || !password) return

    setStatus('submitting')
    setMessage('')

    const supabase = createClient()

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setMessage('Credenciales incorrectas.')
      setStatus('error')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', user!.id)
      .single()

    if (profile?.rol === 'admin') {
      router.push('/admin')
    } else {
      await supabase.auth.signOut()
      setMessage('Sin acceso.')
      setStatus('error')
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#050810', color: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '6px', textTransform: 'uppercase', color: '#c9a227', marginBottom: '10px' }}>
            Panel Administrativo
          </div>
          <h1 style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: '3.5rem', letterSpacing: '4px', lineHeight: 0.9 }}>
            ACCESO
          </h1>
          <div style={{ width: '40px', height: '2px', background: 'linear-gradient(90deg, transparent, #c9a227, transparent)', margin: '14px auto 0' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ background: 'rgba(7,20,40,0.6)', border: '1px solid rgba(42,107,194,0.15)', padding: '32px', borderRadius: '2px' }}>

            <div style={{ marginBottom: '20px' }}>
              <label style={LABEL}>Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle('email')}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={LABEL}>Contraseña</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={inputStyle('password')}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
              />
            </div>

            {status === 'error' && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', padding: '12px 16px', fontSize: '0.875rem', fontFamily: 'var(--font-barlow), sans-serif', borderRadius: '2px', marginBottom: '20px' }}>
                {message}
              </div>
            )}

            {status === 'reset-sent' && (
              <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.4)', color: '#22c55e', padding: '12px 16px', fontSize: '0.875rem', fontFamily: 'var(--font-barlow), sans-serif', borderRadius: '2px', marginBottom: '20px' }}>
                ✓ Si el email existe, vas a recibir el link de recuperación en breve.
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              style={{
                width:        '100%',
                background:   status === 'submitting' ? 'rgba(201,162,39,0.5)' : '#c9a227',
                color:        '#050810',
                fontFamily:   'var(--font-barlow-condensed), sans-serif',
                fontSize:     '1rem',
                fontWeight:   900,
                letterSpacing:'4px',
                textTransform:'uppercase',
                border:       'none',
                padding:      '16px',
                borderRadius: '2px',
                cursor:       status === 'submitting' ? 'not-allowed' : 'pointer',
                transition:   'background 0.2s',
              }}
            >
              {status === 'submitting' ? 'INGRESANDO...' : 'INGRESAR'}
            </button>

            {/* Recuperar contraseña */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  background:    'none',
                  border:        'none',
                  color:         '#8a9ab5',
                  fontFamily:    'var(--font-barlow-condensed), sans-serif',
                  fontSize:      '0.75rem',
                  letterSpacing: '1px',
                  cursor:        'pointer',
                  textDecoration:'underline',
                  padding:       0,
                }}
              >
                Olvidé mi contraseña
              </button>
            </div>

          </div>
        </form>

      </div>
    </main>
  )
}
