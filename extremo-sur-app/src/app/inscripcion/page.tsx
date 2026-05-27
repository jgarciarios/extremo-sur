'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { FajaTipo, DivisionTipo, CategoriaTipo } from '@/lib/types'

// ─── Types ───────────────────────────────────────────────────────────────────

type FormFields = {
  nombre_completo: string
  documento:       string
  email:           string
  telefono:        string
  academia:        string
  ciudad_pais:     string
  faja:            FajaTipo | ''
  division:        DivisionTipo | ''
  categoria:       CategoriaTipo | ''
  peso_kg:         string
}

type FieldErrors = Partial<Record<keyof FormFields, string>>
type Status = 'idle' | 'submitting' | 'success' | 'error'

const EMPTY: FormFields = {
  nombre_completo: '',
  documento:       '',
  email:           '',
  telefono:        '',
  academia:        '',
  ciudad_pais:     '',
  faja:            '',
  division:        '',
  categoria:       '',
  peso_kg:         '',
}

// ─── Shared style constants ───────────────────────────────────────────────────

const LABEL_STYLE: React.CSSProperties = {
  display:        'block',
  fontFamily:     'var(--font-barlow-condensed), sans-serif',
  fontSize:       '0.72rem',
  fontWeight:     700,
  letterSpacing:  '2px',
  textTransform:  'uppercase',
  color:          '#8a9ab5',
  marginBottom:   '6px',
}

const BASE_INPUT: React.CSSProperties = {
  width:           '100%',
  background:      'rgba(13,33,68,0.8)',
  border:          '1px solid rgba(42,107,194,0.3)',
  borderRadius:    '2px',
  color:           '#f0f4ff',
  fontFamily:      'var(--font-barlow), sans-serif',
  fontSize:        '1rem',
  padding:         '12px 16px',
  outline:         'none',
  transition:      'border-color 0.2s, box-shadow 0.2s',
  appearance:      'none',
  WebkitAppearance: 'none',
}

const ERROR_TEXT: React.CSSProperties = {
  fontFamily:    'var(--font-barlow), sans-serif',
  fontSize:      '0.75rem',
  color:         '#ef4444',
  marginTop:     '4px',
}

const SECTION_LABEL: React.CSSProperties = {
  fontFamily:    'var(--font-barlow-condensed), sans-serif',
  fontSize:      '0.7rem',
  fontWeight:    700,
  letterSpacing: '4px',
  color:         '#c9a227',
  textTransform: 'uppercase',
  marginBottom:  '24px',
  paddingBottom: '12px',
  borderBottom:  '1px solid rgba(201,162,39,0.15)',
}

const CARD: React.CSSProperties = {
  background:    'rgba(7,20,40,0.6)',
  border:        '1px solid rgba(42,107,194,0.15)',
  padding:       '36px 40px',
  marginBottom:  '2px',
}

const GRID_2: React.CSSProperties = {
  display:             'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap:                 '20px',
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function InscripcionPage() {
  const [form,         setForm]         = useState<FormFields>(EMPTY)
  const [errors,       setErrors]       = useState<FieldErrors>({})
  const [status,       setStatus]       = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [focused,      setFocused]      = useState<string | null>(null)
  const [successName,  setSuccessName]  = useState('')

  // ── Validation ─────────────────────────────────────────────────────────────

  function validate(): boolean {
    const e: FieldErrors = {}

    if (!form.nombre_completo.trim()) e.nombre_completo = 'Requerido'
    if (!form.documento.trim())       e.documento       = 'Requerido'

    if (!form.email.trim()) {
      e.email = 'Requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Email inválido'
    }

    if (!form.telefono.trim())    e.telefono    = 'Requerido'
    if (!form.academia.trim())    e.academia    = 'Requerido'
    if (!form.ciudad_pais.trim()) e.ciudad_pais = 'Requerido'
    if (!form.faja)               e.faja        = 'Seleccioná una opción'
    if (!form.division)           e.division    = 'Seleccioná una opción'
    if (!form.categoria)          e.categoria   = 'Seleccioná una opción'

    const peso = parseFloat(form.peso_kg)
    if (!form.peso_kg) {
      e.peso_kg = 'Requerido'
    } else if (isNaN(peso) || peso < 30 || peso > 150) {
      e.peso_kg = 'Ingresá un valor entre 30 y 150 kg'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validate()) return

    setStatus('submitting')
    setErrorMessage('')

    try {
      const supabase = createClient()

      const { data: eventos, error: eventoErr } = await supabase
        .from('eventos')
        .select('id')
        .eq('activo', true)
        .order('fecha', { ascending: true })
        .limit(1)

      if (eventoErr) throw eventoErr
      if (!eventos?.length) throw new Error('No hay eventos activos en este momento.')

      const { error: insertErr } = await supabase.from('inscripciones').insert({
        evento_id: eventos[0].id,
        nombre:    form.nombre_completo.trim(),
        documento: form.documento.trim(),
        email:     form.email.trim().toLowerCase(),
        telefono:  form.telefono.trim(),
        academia:  form.academia.trim(),
        ciudad:    form.ciudad_pais.trim(),
        faja:      form.faja || null,
        division:  form.division,
        categoria: form.categoria,
        peso_kg:   parseFloat(form.peso_kg),
      })

      if (insertErr) throw insertErr

      setSuccessName(form.nombre_completo.trim())
      setStatus('success')
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Error inesperado. Intentá de nuevo.'
      )
      setStatus('error')
    }
  }

  // ── Field change ────────────────────────────────────────────────────────────

  function handleChange(ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = ev.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormFields]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  // ── Derived input style ─────────────────────────────────────────────────────

  function inputStyle(name: string): React.CSSProperties {
    const hasError = !!errors[name as keyof FormFields]
    return {
      ...BASE_INPUT,
      borderColor: hasError        ? '#ef4444'
                 : focused === name ? '#c9a227'
                 : 'rgba(42,107,194,0.3)',
      boxShadow: focused === name && !hasError
        ? '0 0 0 1px rgba(201,162,39,0.15)'
        : 'none',
    }
  }

  function fp(name: string) {
    return {
      onFocus: () => setFocused(name),
      onBlur:  () => setFocused(null),
    }
  }

  // ── Success view ─────────────────────────────────────────────────────────────

  if (status === 'success') {
    return (
      <main style={{ minHeight: '100vh', background: '#050810', color: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ maxWidth: '560px', width: '100%', textAlign: 'center' }}>

          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', border: '2px solid #c9a227', borderRadius: '2px', marginBottom: '32px' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>

          <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '6px', textTransform: 'uppercase', color: '#c9a227', marginBottom: '12px' }}>
            Inscripción recibida
          </div>

          <h1 style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: 'clamp(2.5rem, 8vw, 5rem)', letterSpacing: '4px', lineHeight: 0.9, marginBottom: '20px' }}>
            {successName.toUpperCase()}
          </h1>

          <div style={{ width: '60px', height: '2px', background: 'linear-gradient(90deg, transparent, #c9a227, transparent)', margin: '0 auto 32px' }} />

          <div style={{ background: 'rgba(13,33,68,0.8)', border: '1px solid rgba(201,162,39,0.25)', padding: '28px 32px', textAlign: 'left', marginBottom: '32px', borderRadius: '2px' }}>
            <p style={{ fontFamily: 'var(--font-barlow), sans-serif', fontSize: '1rem', lineHeight: 1.8, color: '#f0f4ff', margin: 0 }}>
              Tu inscripción fue registrada. Para confirmar tu lugar, realizá la transferencia de{' '}
              <strong style={{ color: '#c9a227' }}>USD 25</strong>{' '}
              e indicá tu nombre completo.
            </p>
          </div>

          <a href="https://extremo-sur.netlify.app" style={{ display: 'inline-block', border: '1px solid rgba(201,162,39,0.5)', color: '#c9a227', fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', textDecoration: 'none', padding: '14px 32px', borderRadius: '2px' }}>
            VOLVER AL INICIO
          </a>

        </div>
      </main>
    )
  }

  // ── Form view ─────────────────────────────────────────────────────────────────

  return (
    <main style={{ minHeight: '100vh', background: '#050810', color: '#f0f4ff', padding: '72px 24px 64px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '6px', textTransform: 'uppercase', color: '#c9a227', marginBottom: '12px' }}>
            Circuito 2026 · Maldonado, Uruguay
          </div>
          <h1 style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: 'clamp(3rem, 10vw, 6rem)', letterSpacing: '4px', lineHeight: 0.9 }}>
            INSCRIPCIÓN
          </h1>
          <div style={{ width: '60px', height: '2px', background: 'linear-gradient(90deg, transparent, #c9a227, transparent)', margin: '16px auto 20px' }} />
          <div style={{ display: 'inline-block', background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.35)', padding: '8px 22px', fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '2px', color: '#c9a227', borderRadius: '2px' }}>
            PRÓXIMA FECHA: 30 DE MAYO 2026 · USD 25
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>

          {/* 01 · Datos personales */}
          <div style={CARD}>
            <div style={SECTION_LABEL}>01 · Datos Personales</div>
            <div style={GRID_2}>
              <Field label="Nombre completo" error={errors.nombre_completo}>
                <input name="nombre_completo" type="text" required placeholder="Juan García" value={form.nombre_completo} onChange={handleChange} style={inputStyle('nombre_completo')} {...fp('nombre_completo')} />
              </Field>
              <Field label="CI / DNI" error={errors.documento}>
                <input name="documento" type="text" required inputMode="numeric" pattern="[0-9]*" placeholder="1.234.567-8" value={form.documento} onChange={handleChange} onKeyDown={e => { if (!/[0-9]/.test(e.key) && !['Backspace','Delete','Tab','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault() }} style={inputStyle('documento')} {...fp('documento')} />
              </Field>
              <Field label="Email" error={errors.email}>
                <input name="email" type="email" required placeholder="juan@email.com" value={form.email} onChange={handleChange} style={inputStyle('email')} {...fp('email')} />
              </Field>
              <Field label="Teléfono" error={errors.telefono}>
                <input name="telefono" type="tel" required inputMode="numeric" pattern="[0-9]*" placeholder="+598 99 123 456" value={form.telefono} onChange={handleChange} onKeyDown={e => { if (!/[0-9]/.test(e.key) && !['Backspace','Delete','Tab','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault() }} style={inputStyle('telefono')} {...fp('telefono')} />
              </Field>
            </div>
          </div>

          {/* 02 · Academia */}
          <div style={CARD}>
            <div style={SECTION_LABEL}>02 · Academia y Procedencia</div>
            <div style={GRID_2}>
              <Field label="Academia" error={errors.academia}>
                <input name="academia" type="text" required placeholder="Nombre de tu equipo" value={form.academia} onChange={handleChange} style={inputStyle('academia')} {...fp('academia')} />
              </Field>
              <Field label="Ciudad / País" error={errors.ciudad_pais}>
                <input name="ciudad_pais" type="text" required placeholder="Montevideo, Uruguay" value={form.ciudad_pais} onChange={handleChange} style={inputStyle('ciudad_pais')} {...fp('ciudad_pais')} />
              </Field>
            </div>
          </div>

          {/* 03 · Categoría */}
          <div style={{ ...CARD, marginBottom: '24px' }}>
            <div style={SECTION_LABEL}>03 · Categoría</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px' }}>
              <Field label="Faja" error={errors.faja}>
                <select name="faja" required value={form.faja} onChange={handleChange} style={{ ...inputStyle('faja'), cursor: 'pointer' }} {...fp('faja')}>
                  <option value="" disabled>Seleccioná</option>
                  <option value="blanca">Blanca</option>
                  <option value="azul">Azul</option>
                  <option value="morada">Morada</option>
                  <option value="marron">Marrón</option>
                  <option value="negra">Negra</option>
                </select>
              </Field>
              <Field label="División" error={errors.division}>
                <select name="division" required value={form.division} onChange={handleChange} style={{ ...inputStyle('division'), cursor: 'pointer' }} {...fp('division')}>
                  <option value="" disabled>Seleccioná</option>
                  <option value="gi">Gi</option>
                  <option value="nogi">No-Gi</option>
                  <option value="ambas">Ambas</option>
                </select>
              </Field>
              <Field label="Categoría" error={errors.categoria}>
                <select name="categoria" required value={form.categoria} onChange={handleChange} style={{ ...inputStyle('categoria'), cursor: 'pointer' }} {...fp('categoria')}>
                  <option value="" disabled>Seleccioná</option>
                  <option value="kids">Kids</option>
                  <option value="juvenil">Juvenil</option>
                  <option value="adulto">Adulto</option>
                  <option value="master">Master</option>
                  <option value="absoluto">Absoluto</option>
                </select>
              </Field>
              <Field label="Peso (kg)" error={errors.peso_kg}>
                <input name="peso_kg" type="number" required min={30} max={150} step={0.1} placeholder="70" value={form.peso_kg} onChange={handleChange} style={inputStyle('peso_kg')} {...fp('peso_kg')} />
              </Field>
            </div>
          </div>

          {/* Error banner */}
          {status === 'error' && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', padding: '14px 18px', fontFamily: 'var(--font-barlow), sans-serif', fontSize: '0.9rem', marginBottom: '20px', borderRadius: '2px' }}>
              {errorMessage}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === 'submitting'}
            style={{
              width:        '100%',
              background:   status === 'submitting' ? 'rgba(201,162,39,0.5)' : '#c9a227',
              color:        '#050810',
              fontFamily:   'var(--font-barlow-condensed), sans-serif',
              fontSize:     '1.1rem',
              fontWeight:   900,
              letterSpacing:'4px',
              textTransform:'uppercase',
              border:       'none',
              padding:      '20px',
              borderRadius: '2px',
              cursor:       status === 'submitting' ? 'not-allowed' : 'pointer',
              transition:   'background 0.2s',
            }}
          >
            {status === 'submitting' ? 'ENVIANDO...' : 'CONFIRMAR INSCRIPCIÓN'}
          </button>

        </form>
      </div>
    </main>
  )
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label:    string
  error?:   string
  children: React.ReactNode
}) {
  return (
    <div>
      <label style={LABEL_STYLE}>{label}</label>
      {children}
      {error && <p style={ERROR_TEXT}>{error}</p>}
    </div>
  )
}
