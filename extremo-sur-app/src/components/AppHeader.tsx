'use client'

import { useState } from 'react'

// ─── AppHeader — nav global para páginas internas ─────────────────────────────
// Uso: <AppHeader /> en cualquier página que no sea la landing ni el admin.
// Activo: pasar `active="inscripcion"` etc. para resaltar el link actual.

type NavPage = 'inscripcion' | 'inscriptos' | 'perfil' | 'login'

interface Props {
  active?: NavPage
}

export function AppHeader({ active }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  const LINKS: { href: string; label: string; key: NavPage | null }[] = [
    { href: '/#fechas',    label: 'Fechas',     key: null          },
    { href: '/inscriptos', label: 'Competidores', key: 'inscriptos' },
    { href: '/inscripcion',label: 'Inscribite', key: 'inscripcion' },
  ]

  return (
    <header style={{
      position:     'fixed',
      top:          0,
      left:         0,
      right:        0,
      zIndex:       100,
      background:   'rgba(5,8,16,0.95)',
      backdropFilter:'blur(12px)',
      borderBottom: '1px solid rgba(42,107,194,0.15)',
      display:      'flex',
      justifyContent:'space-between',
      alignItems:   'center',
      padding:      '0 40px',
      height:       '64px',
    }}>

      {/* Logo */}
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
        <img
          src="/assets/img/logo.jpeg"
          alt="Extremo Sur BJJ"
          style={{ height: 40, width: 'auto', objectFit: 'contain' }}
        />
        <span style={{
          fontFamily:    'var(--font-bebas-neue), sans-serif',
          fontSize:      '1.3rem',
          letterSpacing: '3px',
          color:         '#f0f4ff',
          lineHeight:    1,
        }}>
          EXTREMO SUR
        </span>
      </a>

      {/* Desktop nav */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {LINKS.map(({ href, label, key }) => (
          <a
            key={href}
            href={href}
            style={{
              fontFamily:    'var(--font-barlow-condensed), sans-serif',
              fontSize:      '0.78rem',
              fontWeight:    700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              textDecoration:'none',
              padding:       '8px 16px',
              color:         key && active === key ? '#c9a227' : '#8a9ab5',
              borderBottom:  key && active === key ? '2px solid #c9a227' : '2px solid transparent',
              transition:    'color 0.2s',
            }}
            onMouseEnter={e => { if (active !== key) e.currentTarget.style.color = '#f0f4ff' }}
            onMouseLeave={e => { if (active !== key) e.currentTarget.style.color = '#8a9ab5' }}
          >
            {label}
          </a>
        ))}

        {/* Mi cuenta / Perfil */}
        <a
          href="/perfil"
          style={{
            fontFamily:    'var(--font-barlow-condensed), sans-serif',
            fontSize:      '0.78rem',
            fontWeight:    700,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            textDecoration:'none',
            padding:       '8px 16px',
            marginLeft:    '4px',
            color:         active === 'perfil' || active === 'login' ? '#c9a227' : '#8a9ab5',
            borderBottom:  active === 'perfil' || active === 'login' ? '2px solid #c9a227' : '2px solid transparent',
            transition:    'color 0.2s',
          }}
          onMouseEnter={e => { if (active !== 'perfil' && active !== 'login') e.currentTarget.style.color = '#f0f4ff' }}
          onMouseLeave={e => { if (active !== 'perfil' && active !== 'login') e.currentTarget.style.color = '#8a9ab5' }}
        >
          Mi cuenta
        </a>

        <a
          href="/inscripcion"
          style={{
            fontFamily:    'var(--font-barlow-condensed), sans-serif',
            fontSize:      '0.78rem',
            fontWeight:    900,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            textDecoration:'none',
            padding:       '9px 20px',
            marginLeft:    '8px',
            background:    '#c9a227',
            color:         '#050810',
            borderRadius:  '2px',
            transition:    'background 0.2s',
            whiteSpace:    'nowrap',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#e8c14a')}
          onMouseLeave={e => (e.currentTarget.style.background = '#c9a227')}
        >
          INSCRIBITE
        </a>
      </nav>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMenuOpen(m => !m)}
        aria-label="Menú"
        style={{
          display:     'none',
          background:  'none',
          border:      'none',
          cursor:      'pointer',
          padding:     '8px',
          flexDirection:'column',
          gap:         '5px',
        }}
        className="app-header-hamburger"
      >
        {[0,1,2].map(i => (
          <span key={i} style={{ display: 'block', width: 22, height: 2, background: '#f0f4ff', borderRadius: 1 }} />
        ))}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position:   'absolute',
          top:        '64px',
          left:       0,
          right:      0,
          background: 'rgba(5,8,16,0.98)',
          borderBottom:'1px solid rgba(42,107,194,0.2)',
          padding:    '16px 24px 24px',
          display:    'flex',
          flexDirection:'column',
          gap:        '4px',
        }}>
          {[...LINKS, { href: '/perfil', label: 'Mi cuenta', key: 'perfil' as NavPage }].map(({ href, label, key }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily:    'var(--font-barlow-condensed), sans-serif',
                fontSize:      '1rem',
                fontWeight:    700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                textDecoration:'none',
                padding:       '14px 0',
                color:         key && active === key ? '#c9a227' : '#f0f4ff',
                borderBottom:  '1px solid rgba(42,107,194,0.1)',
              }}
            >
              {label}
            </a>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .app-header-hamburger { display: flex !important; }
          header nav { display: none !important; }
        }
      `}</style>
    </header>
  )
}
