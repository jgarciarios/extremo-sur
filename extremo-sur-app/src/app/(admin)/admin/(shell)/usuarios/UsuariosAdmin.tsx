'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Admin { id: string; nombre?: string; rol: string }
interface Props { admins: Admin[] }

export function UsuariosAdmin({ admins: initial }: Props) {
  const [admins,  setAdmins]  = useState(initial)
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [msg,     setMsg]     = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  async function promover() {
    if (!email.trim()) return
    setLoading(true)
    setMsg(null)
    const supabase = createClient()

    // Buscar el user por email en auth (necesitamos el ID)
    // Como no tenemos acceso a auth.admin desde client, usamos una función RPC o buscamos en profiles
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, nombre, rol')
      .eq('email', email.trim().toLowerCase())
      .single()

    // profiles puede no tener columna email — buscamos por user_metadata
    // Si no encuentra, intentamos con auth
    if (error || !profile) {
      setMsg({ type: 'err', text: 'Usuario no encontrado. Debe estar registrado en el sistema.' })
      setLoading(false)
      return
    }

    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ rol: 'admin' })
      .eq('id', profile.id)

    if (updateErr) {
      setMsg({ type: 'err', text: 'Error al promover usuario. Verificá los permisos.' })
    } else {
      setMsg({ type: 'ok', text: `${email} ahora es administrador.` })
      setAdmins(prev => [...prev, { id: profile.id, nombre: profile.nombre, rol: 'admin' }])
      setEmail('')
    }
    setLoading(false)
  }

  async function revocar(id: string) {
    const supabase = createClient()
    await supabase.from('profiles').update({ rol: 'usuario' }).eq('id', id)
    setAdmins(prev => prev.filter(a => a.id !== id))
  }

  return (
    <>
      {/* Agregar admin */}
      <div className="adm-card" style={{ marginBottom: 20 }}>
        <div className="adm-card-header">
          <span className="adm-card-title">Agregar administrador</span>
        </div>
        <div className="adm-card-body">
          <p style={{ color: 'var(--adm-muted)', fontSize: '0.8rem', marginBottom: 16 }}>
            El usuario debe estar registrado en el sistema. Al promoverlo podrá acceder al panel admin.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              className="adm-input"
              type="email"
              placeholder="email@academia.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ minWidth: 260 }}
              onKeyDown={e => e.key === 'Enter' && promover()}
            />
            <button className="adm-btn primary" disabled={loading || !email.trim()} onClick={promover}>
              {loading ? 'Buscando...' : 'Promover a admin'}
            </button>
          </div>
          {msg && (
            <div style={{
              marginTop: 12, padding: '10px 14px', borderRadius: 2,
              background: msg.type === 'ok' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${msg.type === 'ok' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: msg.type === 'ok' ? '#22c55e' : '#ef4444',
              fontSize: '0.8rem',
            }}>
              {msg.text}
            </div>
          )}
        </div>
      </div>

      {/* Lista de admins */}
      <div className="adm-card">
        <div className="adm-card-header">
          <span className="adm-card-title">Administradores activos</span>
        </div>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Rol</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--adm-muted)', padding: 40 }}>Sin administradores</td></tr>
              ) : admins.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{a.nombre ?? 'Sin nombre'}</td>
                  <td>
                    <span className={`adm-badge ${a.rol === 'superadmin' ? 'blue' : 'yellow'}`}>
                      {a.rol}
                    </span>
                  </td>
                  <td>
                    {a.rol !== 'superadmin' && (
                      <button
                        className="adm-btn danger"
                        style={{ padding: '4px 10px', fontSize: '0.65rem' }}
                        onClick={() => revocar(a.id)}
                      >
                        Revocar acceso
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
