'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const BASE_INPUT: React.CSSProperties = {
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

export default function ResetPasswordPage() {
  const router  = useRouter()
  const [password,  setPassword]  = useState('')
  const [password2, setPassword2] = useState('')
  const [status,    setStatus]    = useState<Status>('idle')
  const [message,   setMessage]   = useState('')

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()

    if (password.length < 8) {
      setMessage('La contraseña debe tener al menos 8 caracteres.')
      setStatus('error')
      return
    }
    if (password !== password2) {
      setMessage('Las contraseñas no coinciden.')
      setStatus('error')
      return
    }

    setStatus('submitting')
    setMessage('')

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setMessage('No se pudo actualizar la contraseña. El link puede haber expirado.')
      setStatus('error')
      return
    }

    setStatus('success')
    setTimeout(() => router.push('/admin/login'), 2000)
  }

  return (
    <main style={{
      minHeight:      '100vh',
      background:     '#050810',
      color:          '#f0f4ff',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '6px', textTransform: 'uppercase', color: '#c9a227', marginBottom: '10px' }}>
            Panel Administrativo
          </div>
          <h1 style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: '3rem', letterSpacing: '4px', lineHeight: 0.9 }}>
            NUEVA CONTRASEÑA
          </h1>
          <div style={{ width: '40px', height: '2px', background: 'linear-gradient(90deg, transparent, #c9a227, transparent)', margin: '14px auto 0' }} />
        </div>

        {status === 'success' ? (
          <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.4)', color: '#22c55e', padding: '20px 24px', fontSize: '0.9rem', fontFamily: 'var(--font-barlow), sans-serif', borderRadius: '2px', textAlign: 'center' }}>
            ✓ Contraseña actualizada. Redirigiendo al login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ background: 'rgba(7,20,40,0.6)', border: '1px solid rgba(42,107,194,0.15)', padding: '32px', borderRadius: '2px' }}>

              <div style={{ marginBottom: '20px' }}>
                <label style={LABEL}>Nueva contraseña</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setStatus('idle') }}
                  style={BASE_INPUT}
                />
              </div>

              <div style={{ marginBottom: '28px' }}>
                <label style={LABEL}>Confirmar contraseña</label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="Repetí la contraseña"
                  value={password2}
                  onChange={e => { setPassword2(e.target.value); setStatus('idle') }}
                  style={BASE_INPUT}
                />
              </div>

              {status === 'error' && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', padding: '12px 16px', fontSize: '0.875rem', fontFamily: 'var(--font-barlow), sans-serif', borderRadius: '2px', marginBottom: '20px' }}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                style={{
                  width:         '100%',
                  background:    status === 'submitting' ? 'rgba(201,162,39,0.5)' : '#c9a227',
                  color:         '#050810',
                  fontFamily:    'var(--font-barlow-condensed), sans-serif',
                  fontSize:      '1rem',
                  fontWeight:    900,
                  letterSpacing: '4px',
                  textTransform: 'uppercase',
                  border:        'none',
                  padding:       '16px',
                  borderRadius:  '2px',
                  cursor:        status === 'submitting' ? 'not-allowed' : 'pointer',
                }}
              >
                {status === 'submitting' ? 'GUARDANDO...' : 'GUARDAR CONTRASEÑA'}
              </button>

            </div>
          </form>
        )}

      </div>
    </main>
  )
}
