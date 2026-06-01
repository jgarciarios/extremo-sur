'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Tab    = 'login' | 'register'
type Status = 'idle' | 'submitting' | 'error' | 'success'

// ─── Styles ───────────────────────────────────────────────────────────────────

const INPUT: React.CSSProperties = {
  width:        '100%',
  background:   'rgba(13,33,68,0.8)',
  border:       '1px solid rgba(42,107,194,0.3)',
  borderRadius: '2px',
  color:        '#f0f4ff',
  fontFamily:   'var(--font-barlow), sans-serif',
  fontSize:     '1rem',
  padding:      '12px 16px',
  outline:      'none',
  boxSizing:    'border-box',
  transition:   'border-color 0.2s',
}

const LABEL: React.CSSProperties = {
  display:       'block',
  fontFamily:    'var(--font-barlow-condensed), sans-serif',
  fontSize:      '0.72rem',
  fontWeight:    700,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color:         '#8a9ab5',
  marginBottom:  '6px',
}

const BTN_PRIMARY: React.CSSProperties = {
  width:         '100%',
  background:    '#c9a227',
  color:         '#050810',
  fontFamily:    'var(--font-barlow-condensed), sans-serif',
  fontSize:      '1rem',
  fontWeight:    900,
  letterSpacing: '4px',
  textTransform: 'uppercase',
  border:        'none',
  padding:       '16px',
  borderRadius:  '2px',
  cursor:        'pointer',
  transition:    'background 0.2s',
}

export default function LoginPage() {
  const router = useRouter()
  const [tab,      setTab]      = useState<Tab>('login')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [nombre,   setNombre]   = useState('')
  const [status,   setStatus]   = useState<Status>('idle')
  const [message,  setMessage]  = useState('')

  function reset() {
    setStatus('idle')
    setMessage('')
  }

  async function handleGoogleLogin() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/perfil`,
      },
    })
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage('Email o contraseña incorrectos.')
      setStatus('error')
      return
    }
    // Verificar si es admin/llamador → redirigir a su panel
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('rol').eq('id', user.id).single()
      if (profile?.rol === 'admin' || profile?.rol === 'superadmin') {
        router.push('/admin')
        return
      }
      if (profile?.rol === 'llamador') {
        router.push('/llamador')
        return
      }
    }
    router.push('/perfil')
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) {
      setMessage('El nombre es requerido.')
      setStatus('error')
      return
    }
    if (password.length < 8) {
      setMessage('La contraseña debe tener al menos 8 caracteres.')
      setStatus('error')
      return
    }
    setStatus('submitting')
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    })
    if (error) {
      setMessage(error.message === 'User already registered'
        ? 'Ya existe una cuenta con ese email.'
        : 'Error al crear la cuenta. Intentá de nuevo.')
      setStatus('error')
      return
    }
    if (data.user && !data.session) {
      // Email confirmation required
      setStatus('success')
      setMessage('¡Cuenta creada! Revisá tu email para confirmar la cuenta.')
      return
    }
    router.push('/perfil')
  }

  return (
    <main style={{
      minHeight:      '100vh',
      background:     '#050810',
      color:          '#f0f4ff',
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '40px 24px',
      fontFamily:     'var(--font-barlow), sans-serif',
    }}>

      {/* Logo / back */}
      <a href="/" style={{
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        textDecoration:'none',
        marginBottom:  '40px',
      }}>
        <img
          src="/assets/img/logo.jpeg"
          alt="Extremo Sur BJJ"
          style={{ height: 56, width: 'auto', objectFit: 'contain', marginBottom: '10px' }}
        />
        <div style={{
          fontFamily:    'var(--font-barlow-condensed), sans-serif',
          fontSize:      '0.65rem',
          fontWeight:    700,
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color:         '#8a9ab5',
        }}>
          ← Volver al inicio
        </div>
      </a>

      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Tabs */}
        <div style={{
          display:      'grid',
          gridTemplateColumns: '1fr 1fr',
          marginBottom: '2px',
          borderRadius: '2px 2px 0 0',
          overflow:     'hidden',
        }}>
          {(['login', 'register'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); reset() }}
              style={{
                background:    tab === t ? 'rgba(7,20,40,0.9)' : 'rgba(5,8,16,0.6)',
                border:        'none',
                borderBottom:  tab === t ? '2px solid #c9a227' : '2px solid transparent',
                color:         tab === t ? '#f0f4ff' : '#8a9ab5',
                fontFamily:    'var(--font-barlow-condensed), sans-serif',
                fontSize:      '0.8rem',
                fontWeight:    700,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                padding:       '14px',
                cursor:        'pointer',
                transition:    'all 0.2s',
              }}
            >
              {t === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background:   'rgba(7,20,40,0.9)',
          border:       '1px solid rgba(42,107,194,0.15)',
          borderTop:    'none',
          padding:      '32px',
          borderRadius: '0 0 2px 2px',
        }}>

          {/* Google OAuth */}
          {status !== 'success' && (
            <>
              <button
                type="button"
                onClick={handleGoogleLogin}
                style={{
                  width:          '100%',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  gap:            '12px',
                  background:     '#fff',
                  color:          '#1a1a1a',
                  fontFamily:     'var(--font-barlow), sans-serif',
                  fontSize:       '0.95rem',
                  fontWeight:     600,
                  border:         'none',
                  borderRadius:   '2px',
                  padding:        '13px',
                  cursor:         'pointer',
                  marginBottom:   '20px',
                  transition:     'opacity 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Continuar con Google
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(42,107,194,0.2)' }} />
                <span style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.7rem', color: '#8a9ab5', letterSpacing: '2px' }}>O</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(42,107,194,0.2)' }} />
              </div>
            </>
          )}

          {/* Success state */}
          {status === 'success' ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>✉️</div>
              <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: '1.6rem', letterSpacing: '3px', marginBottom: '12px' }}>
                REVISÁ TU EMAIL
              </div>
              <div style={{ color: '#8a9ab5', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {message}
              </div>
              <button
                onClick={() => { setStatus('idle'); setTab('login') }}
                style={{ ...BTN_PRIMARY, marginTop: '24px', background: 'transparent', color: '#c9a227', border: '1px solid #c9a227' }}
              >
                Ir al login
              </button>
            </div>
          ) : (
            <form onSubmit={tab === 'login' ? handleLogin : handleRegister} noValidate>

              {/* Nombre (solo en registro) */}
              {tab === 'register' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={LABEL}>Nombre completo</label>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Tu nombre"
                    value={nombre}
                    onChange={e => { setNombre(e.target.value); reset() }}
                    style={INPUT}
                    onFocus={e  => (e.currentTarget.style.borderColor = '#c9a227')}
                    onBlur={e   => (e.currentTarget.style.borderColor = 'rgba(42,107,194,0.3)')}
                  />
                </div>
              )}

              {/* Email */}
              <div style={{ marginBottom: '20px' }}>
                <label style={LABEL}>Email</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); reset() }}
                  style={INPUT}
                  onFocus={e  => (e.currentTarget.style.borderColor = '#c9a227')}
                  onBlur={e   => (e.currentTarget.style.borderColor = 'rgba(42,107,194,0.3)')}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: tab === 'login' ? '8px' : '28px' }}>
                <label style={LABEL}>Contraseña</label>
                <input
                  type="password"
                  required
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  placeholder={tab === 'register' ? 'Mínimo 8 caracteres' : '••••••••'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); reset() }}
                  style={INPUT}
                  onFocus={e  => (e.currentTarget.style.borderColor = '#c9a227')}
                  onBlur={e   => (e.currentTarget.style.borderColor = 'rgba(42,107,194,0.3)')}
                />
              </div>

              {/* Olvidé contraseña (solo login) */}
              {tab === 'login' && (
                <div style={{ textAlign: 'right', marginBottom: '24px' }}>
                  <a
                    href="/admin/login"
                    style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.72rem', color: '#8a9ab5', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              )}

              {/* Error */}
              {status === 'error' && (
                <div style={{
                  background:   'rgba(239,68,68,0.08)',
                  border:       '1px solid rgba(239,68,68,0.4)',
                  color:        '#ef4444',
                  padding:      '12px 16px',
                  fontSize:     '0.875rem',
                  borderRadius: '2px',
                  marginBottom: '20px',
                }}>
                  {message}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'submitting'}
                style={{
                  ...BTN_PRIMARY,
                  background: status === 'submitting' ? 'rgba(201,162,39,0.5)' : '#c9a227',
                  cursor:     status === 'submitting' ? 'not-allowed' : 'pointer',
                }}
              >
                {status === 'submitting'
                  ? (tab === 'login' ? 'INGRESANDO...' : 'CREANDO CUENTA...')
                  : (tab === 'login' ? 'INGRESAR' : 'CREAR CUENTA')}
              </button>

              {/* Switch tab */}
              <div style={{ textAlign: 'center', marginTop: '20px', fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.78rem', color: '#8a9ab5' }}>
                {tab === 'login' ? (
                  <>¿No tenés cuenta?{' '}
                    <button type="button" onClick={() => { setTab('register'); reset() }}
                      style={{ background: 'none', border: 'none', color: '#c9a227', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline' }}>
                      Creá una gratis
                    </button>
                  </>
                ) : (
                  <>¿Ya tenés cuenta?{' '}
                    <button type="button" onClick={() => { setTab('login'); reset() }}
                      style={{ background: 'none', border: 'none', color: '#c9a227', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline' }}>
                      Iniciá sesión
                    </button>
                  </>
                )}
              </div>

            </form>
          )}
        </div>
      </div>
    </main>
  )
}
