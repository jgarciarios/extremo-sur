'use client'

import { useState } from 'react'
import { AppHeader } from '@/components/AppHeader'

const SUPABASE_FOTOS = 'https://qzturywsyskmnfsgazus.supabase.co/storage/v1/object/public/FOTOS'

const FOTOS = [
  { src: `${SUPABASE_FOTOS}/IMG_8769.JPG`,  label: '1° Etapa 2026' },
  { src: `${SUPABASE_FOTOS}/IMG_9113.jpg`,  label: '1° Etapa 2026' },
  { src: `${SUPABASE_FOTOS}/IMG_9164.jpg`,  label: '1° Etapa 2026' },
  { src: `${SUPABASE_FOTOS}/IMG_9174.jpg`,  label: '1° Etapa 2026' },
  { src: `${SUPABASE_FOTOS}/IMG_9234.jpg`,  label: '1° Etapa 2026' },
  { src: `${SUPABASE_FOTOS}/IMG_9471.jpg`,  label: '1° Etapa 2026' },
  { src: `${SUPABASE_FOTOS}/IMG_9479.jpg`,  label: '1° Etapa 2026' },
  { src: `${SUPABASE_FOTOS}/IMG_9488.jpg`,  label: '1° Etapa 2026' },
  { src: `${SUPABASE_FOTOS}/IMG_9490.jpg`,  label: '1° Etapa 2026' },
  { src: `${SUPABASE_FOTOS}/IMG_9503.jpg`,  label: '1° Etapa 2026' },
  { src: `${SUPABASE_FOTOS}/IMG_9530.jpg`,  label: '1° Etapa 2026' },
  { src: `${SUPABASE_FOTOS}/IMG_9588.jpg`,  label: '1° Etapa 2026' },
]

export default function FotosPage() {
  const [lb, setLb] = useState<{ open: boolean; idx: number }>({ open: false, idx: 0 })

  const open  = (i: number) => setLb({ open: true, idx: i })
  const close = () => setLb(l => ({ ...l, open: false }))
  const prev  = () => setLb(l => ({ ...l, idx: (l.idx - 1 + FOTOS.length) % FOTOS.length }))
  const next  = () => setLb(l => ({ ...l, idx: (l.idx + 1) % FOTOS.length }))

  return (
    <>
      <AppHeader />

      <main style={{ background: 'var(--black, #0a0a0a)', minHeight: '100vh', paddingTop: 80 }}>
        {/* Header */}
        <div style={{ padding: '48px 24px 32px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ color: 'var(--gold, #c9a227)', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>
            Momentos
          </div>
          <h1 style={{ color: '#fff', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', margin: 0 }}>
            GALERÍA DE FOTOS
          </h1>
          <p style={{ color: '#888', marginTop: 12, fontSize: 14 }}>
            {FOTOS.length} fotos · 1° Etapa Extremo Sur 2026
          </p>
        </div>

        {/* Grid */}
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px 80px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 8,
        }}>
          {FOTOS.map((foto, i) => (
            <div
              key={foto.src}
              onClick={() => open(i)}
              style={{
                aspectRatio: '4/3',
                backgroundImage: `url('${foto.src}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0)',
                transition: 'background 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.35)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round" opacity={0.9}>
                  <circle cx="10" cy="10" r="6"/><line x1="15" y1="15" x2="21" y2="21"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Lightbox */}
      {lb.open && (
        <div
          onClick={e => { if (e.target === e.currentTarget) close() }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.95)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <button onClick={close} style={btnStyle('right: 24px; top: 24px')}>✕</button>
          <button onClick={prev}  style={btnStyle('left: 16px; top: 50%; transform: translateY(-50%)')}>←</button>
          <img
            src={FOTOS[lb.idx].src}
            alt="Foto del torneo"
            style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain' }}
          />
          <button onClick={next}  style={btnStyle('right: 16px; top: 50%; transform: translateY(-50%)')}>→</button>
          <div style={{ position: 'absolute', bottom: 24, color: '#888', fontSize: 13 }}>
            {lb.idx + 1} / {FOTOS.length}
          </div>
        </div>
      )}
    </>
  )
}

function btnStyle(pos: string) {
  return {
    position: 'fixed' as const,
    ...Object.fromEntries(
      pos.split(';').filter(Boolean).map(s => {
        const [k, v] = s.trim().split(':')
        return [k.trim().replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase()), v.trim()]
      })
    ),
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    width: 44, height: 44,
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: 18,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }
}
