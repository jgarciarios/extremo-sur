'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  email: string
}

const NAV = [
  {
    section: 'Gestión',
    items: [
      { href: '/admin/dashboard',   label: 'Dashboard',    icon: <IconChart /> },
      { href: '/admin/inscriptos',  label: 'Inscriptos',   icon: <IconUsers /> },
      { href: '/admin/pagos',       label: 'Pagos',        icon: <IconCard /> },
    ],
  },
  {
    section: 'Análisis',
    items: [
      { href: '/admin/categorias',  label: 'Categorías',   icon: <IconTag /> },
      { href: '/admin/academias',   label: 'Academias',    icon: <IconBuilding /> },
    ],
  },
  {
    section: 'Torneo',
    items: [
      { href: '/admin/llaves',      label: 'Llaves',       icon: <IconBracket /> },
    ],
  },
  {
    section: 'Sistema',
    items: [
      { href: '/admin/usuarios',    label: 'Usuarios',     icon: <IconShield /> },
    ],
  },
]

export function AdminSidebar({ email }: Props) {
  const pathname = usePathname()
  const router   = useRouter()
  const [open, setOpen] = useState(false)

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const SidebarContent = () => (
    <>
      <div className="adm-logo">
        <div className="adm-logo-title">EXTREMO SUR</div>
        <div className="adm-logo-sub">Panel Admin</div>
      </div>

      <nav className="adm-nav">
        {NAV.map(group => (
          <div key={group.section}>
            <div className="adm-nav-section">{group.section}</div>
            {group.items.map(item => (
              <a
                key={item.href}
                href={item.href}
                className={`adm-nav-link${pathname === item.href ? ' active' : ''}`}
                onClick={() => setOpen(false)}
              >
                {item.icon}
                {item.label}
              </a>
            ))}
          </div>
        ))}
      </nav>

      <div className="adm-sidebar-footer">
        <div className="adm-sidebar-footer-email">{email}</div>
        <button className="adm-logout-btn" onClick={logout}>Cerrar sesión</button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile header */}
      <div className="adm-mobile-header">
        <button className="adm-hamburger" onClick={() => setOpen(o => !o)} aria-label="Menú">
          <span /><span /><span />
        </button>
        <span style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, letterSpacing: 2, fontSize: '0.9rem' }}>
          ADMIN
        </span>
      </div>

      {/* Overlay */}
      <div
        className={`adm-sidebar-overlay${open ? ' open' : ''}`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`adm-sidebar${open ? ' open' : ''}`}>
        <SidebarContent />
      </aside>
    </>
  )
}

/* ── Icons ── */
function IconChart() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/></svg>
}
function IconUsers() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
function IconCard() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
}
function IconTag() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
}
function IconBuilding() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
}
function IconBracket() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>
}
function IconShield() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
}
