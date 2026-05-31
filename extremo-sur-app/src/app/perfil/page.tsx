'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Inscripcion } from '@/lib/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cap(s: string | null | undefined) {
  if (!s) return '—'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-UY', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

const ESTADO_COLOR: Record<string, string> = {
  pendiente:  '#f59e0b',
  confirmado: '#22c55e',
  presente:   '#3b82f6',
  retirado:   '#ef4444',
}

const DIVISION_LABEL: Record<string, string> = {
  gi: 'Gi', nogi: 'No-Gi', ambas: 'Gi + No-Gi',
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface UserInfo {
  email:  string
  nombre: string | null
}

type InscripcionConEvento = Inscripcion & {
  evento: { nombre: string; fecha: string } | null
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function PerfilPage() {
  const router = useRouter()
  const [user,          setUser]          = useState<UserInfo | null>(null)
  const [inscripciones, setInscripciones] = useState<InscripcionConEvento[]>([])
  const [loading,       setLoading]       = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      setUser({
        email:  user.email ?? '',
        nombre: user.user_metadata?.nombre ?? user.user_metadata?.full_name ?? null,
      })

      const { data } = await supabase
        .from('inscripciones')
        .select('*, evento:eventos(nombre, fecha)')
        .eq('email', user.email!)
        .order('created_at', { ascending: false })

      setInscripciones((data ?? []) as InscripcionConEvento[])
      setLoading(false)
    }
    load()
  }, [router])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <main style={{ minHeight: '100vh', background: '#050810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#8a9ab5', fontFamily: 'var(--font-barlow-condensed), sans-serif', letterSpacing: '2px' }}>Cargando...</div>
    </main>
  )

  return (
    <main style={{
      minHeight:  '100vh',
      background: '#050810',
      color:      '#f0f4ff',
      fontFamily: 'var(--font-barlow), sans-serif',
      padding:    '40px 24px 64px',
    }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>

        {/* Back */}
        <a href="/" style={{
          display:       'inline-block',
          fontFamily:    'var(--font-barlow-condensed), sans-serif',
          fontSize:      '0.65rem',
          fontWeight:    700,
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color:         '#8a9ab5',
          textDecoration:'none',
          marginBottom:  '40px',
        }}>
          ← Volver al inicio
        </a>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '6px', textTransform: 'uppercase', color: '#c9a227', marginBottom: '10px' }}>
            Mi cuenta
          </div>
          <h1 style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: '3rem', letterSpacing: '4px', lineHeight: 0.9, margin: 0 }}>
            {user?.nombre ? user.nombre.toUpperCase() : 'MI PERFIL'}
          </h1>
          <div style={{ width: '40px', height: '2px', background: 'linear-gradient(90deg, transparent, #c9a227, transparent)', margin: '14px auto 0' }} />
        </div>

        {/* Info básica */}
        <div style={{
          background:   'rgba(7,20,40,0.6)',
          border:       '1px solid rgba(42,107,194,0.15)',
          padding:      '24px 28px',
          borderRadius: '2px',
          marginBottom: '32px',
        }}>
          <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#8a9ab5', marginBottom: '4px' }}>
            Email
          </div>
          <div style={{ fontSize: '1rem', color: '#f0f4ff' }}>{user?.email}</div>
        </div>

        {/* Inscripciones */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '5px', textTransform: 'uppercase', color: '#c9a227', marginBottom: '16px' }}>
            Mis Inscripciones
          </div>

          {inscripciones.length === 0 ? (
            <div style={{
              background:   'rgba(7,20,40,0.4)',
              border:       '1px solid rgba(42,107,194,0.1)',
              padding:      '40px 28px',
              borderRadius: '2px',
              textAlign:    'center',
            }}>
              <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.85rem', color: '#8a9ab5', letterSpacing: '1px', marginBottom: '16px' }}>
                No tenés inscripciones todavía.
              </div>
              <a href="/inscripcion" style={{
                display:       'inline-block',
                background:    '#c9a227',
                color:         '#050810',
                fontFamily:    'var(--font-barlow-condensed), sans-serif',
                fontSize:      '0.85rem',
                fontWeight:    900,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                textDecoration:'none',
                padding:       '12px 24px',
                borderRadius:  '2px',
              }}>
                Inscribirte ahora
              </a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {inscripciones.map(ins => (
                <div key={ins.id} style={{
                  background:   'rgba(7,20,40,0.6)',
                  border:       '1px solid rgba(42,107,194,0.15)',
                  borderRadius: '2px',
                  overflow:     'hidden',
                }}>
                  {/* Header card */}
                  <div style={{
                    background:    'rgba(5,8,16,0.5)',
                    borderBottom:  '1px solid rgba(42,107,194,0.12)',
                    padding:       '12px 20px',
                    display:       'flex',
                    justifyContent:'space-between',
                    alignItems:    'center',
                    gap:           '12px',
                    flexWrap:      'wrap',
                  }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: '1.1rem', letterSpacing: '2px', color: '#f0f4ff', lineHeight: 1.1 }}>
                        {ins.evento?.nombre ?? 'Evento'}
                      </div>
                      {ins.evento?.fecha && (
                        <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.68rem', color: '#8a9ab5', letterSpacing: '1px', marginTop: '2px' }}>
                          {formatFecha(ins.evento.fecha)}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
                      <span style={{
                        fontFamily:    'var(--font-barlow-condensed), sans-serif',
                        fontSize:      '0.65rem',
                        fontWeight:    700,
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        color:         ESTADO_COLOR[ins.estado] ?? '#8a9ab5',
                        border:        `1px solid ${ESTADO_COLOR[ins.estado] ?? '#8a9ab5'}`,
                        padding:       '3px 10px',
                        borderRadius:  '2px',
                      }}>
                        {cap(ins.estado)}
                      </span>
                      <span style={{
                        fontFamily:    'var(--font-barlow-condensed), sans-serif',
                        fontSize:      '0.65rem',
                        fontWeight:    700,
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        color:         ins.pagado ? '#22c55e' : '#f59e0b',
                        border:        `1px solid ${ins.pagado ? '#22c55e' : '#f59e0b'}`,
                        padding:       '3px 10px',
                        borderRadius:  '2px',
                      }}>
                        {ins.pagado ? 'Pagado' : 'Pago pendiente'}
                      </span>
                    </div>
                  </div>

                  {/* Categoría */}
                  <div style={{
                    padding:             '16px 20px',
                    display:             'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
                    gap:                 '12px',
                  }}>
                    {[
                      { label: 'Faixa',     value: cap(ins.faja) },
                      { label: 'División',  value: DIVISION_LABEL[ins.division] ?? cap(ins.division) },
                      { label: 'Categoría', value: cap(ins.categoria) },
                      { label: 'Peso',      value: ins.peso_kg >= 999 ? 'Absoluto' : `≤ ${ins.peso_kg} kg` },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#8a9ab5', marginBottom: '3px' }}>
                          {label}
                        </div>
                        <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.9rem', fontWeight: 600, color: '#f0f4ff' }}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            width:         '100%',
            background:    'transparent',
            border:        '1px solid rgba(239,68,68,0.4)',
            color:         '#ef4444',
            fontFamily:    'var(--font-barlow-condensed), sans-serif',
            fontSize:      '0.85rem',
            fontWeight:    700,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            padding:       '14px',
            borderRadius:  '2px',
            cursor:        'pointer',
          }}
        >
          Cerrar sesión
        </button>

      </div>
    </main>
  )
}
