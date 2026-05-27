'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { FajaTipo, DivisionTipo, CategoriaTipo } from '@/lib/types'

// ─── Weight table (IBJJF) ─────────────────────────────────────────────────────

type WeightOption = { key: string; label: string; range: string; max: number }

const W_MASC_JUVENIL: WeightOption[] = [
  { key: 'galo',        label: 'Galo (Rooster)',   range: '≤ 53.5 kg',  max: 53.5  },
  { key: 'pluma',       label: 'Pluma',             range: '≤ 58.5 kg',  max: 58.5  },
  { key: 'pena',        label: 'Pena',              range: '≤ 64 kg',    max: 64    },
  { key: 'leve',        label: 'Leve',              range: '≤ 69 kg',    max: 69    },
  { key: 'medio',       label: 'Médio',             range: '≤ 74 kg',    max: 74    },
  { key: 'meiopes',     label: 'Meio-pesado',       range: '≤ 79.3 kg',  max: 79.3  },
  { key: 'pesado',      label: 'Pesado',            range: '≤ 84.3 kg',  max: 84.3  },
  { key: 'superpesado', label: 'Super-pesado',      range: '≤ 89.3 kg',  max: 89.3  },
  { key: 'pesadissimo', label: 'Pesadíssimo',       range: 'Sin límite', max: 999   },
  { key: 'absoluto',    label: 'Absoluto',          range: 'Peso libre', max: 999   },
]

const W_MASC_ADULTO: WeightOption[] = [
  { key: 'galo',        label: 'Galo (Rooster)',   range: '≤ 57.5 kg',  max: 57.5  },
  { key: 'pluma',       label: 'Pluma',             range: '≤ 64 kg',    max: 64    },
  { key: 'pena',        label: 'Pena',              range: '≤ 70 kg',    max: 70    },
  { key: 'leve',        label: 'Leve',              range: '≤ 76 kg',    max: 76    },
  { key: 'medio',       label: 'Médio',             range: '≤ 82.3 kg',  max: 82.3  },
  { key: 'meiopes',     label: 'Meio-pesado',       range: '≤ 88.3 kg',  max: 88.3  },
  { key: 'pesado',      label: 'Pesado',            range: '≤ 94.3 kg',  max: 94.3  },
  { key: 'superpesado', label: 'Super-pesado',      range: '≤ 100.5 kg', max: 100.5 },
  { key: 'pesadissimo', label: 'Pesadíssimo',       range: 'Sin límite', max: 999   },
  { key: 'absoluto',    label: 'Absoluto',          range: 'Peso libre', max: 999   },
]

const W_FEM_JUVENIL: WeightOption[] = [
  { key: 'galo',        label: 'Galo (Rooster)',   range: '≤ 44.3 kg',  max: 44.3  },
  { key: 'pluma',       label: 'Pluma',             range: '≤ 48.3 kg',  max: 48.3  },
  { key: 'pena',        label: 'Pena',              range: '≤ 52.5 kg',  max: 52.5  },
  { key: 'leve',        label: 'Leve',              range: '≤ 56.5 kg',  max: 56.5  },
  { key: 'medio',       label: 'Médio',             range: '≤ 60.5 kg',  max: 60.5  },
  { key: 'meiopes',     label: 'Meio-pesado',       range: '≤ 65 kg',    max: 65    },
  { key: 'pesado',      label: 'Pesado',            range: '≤ 69 kg',    max: 69    },
  { key: 'superpesado', label: 'Super-pesado',      range: 'Sin límite', max: 999   },
  { key: 'pesadissimo', label: 'Pesadíssimo',       range: 'Sin límite', max: 999   },
  { key: 'absoluto',    label: 'Absoluto',          range: 'Peso libre', max: 999   },
]

const W_FEM_ADULTO: WeightOption[] = [
  { key: 'galo',        label: 'Galo (Rooster)',   range: '≤ 45.5 kg',  max: 45.5  },
  { key: 'pluma',       label: 'Pluma',             range: '≤ 53.5 kg',  max: 53.5  },
  { key: 'pena',        label: 'Pena',              range: '≤ 58.5 kg',  max: 58.5  },
  { key: 'leve',        label: 'Leve',              range: '≤ 64 kg',    max: 64    },
  { key: 'medio',       label: 'Médio',             range: '≤ 69 kg',    max: 69    },
  { key: 'meiopes',     label: 'Meio-pesado',       range: '≤ 74 kg',    max: 74    },
  { key: 'pesado',      label: 'Pesado',            range: '≤ 79.3 kg',  max: 79.3  },
  { key: 'superpesado', label: 'Super-pesado',      range: 'Sin límite', max: 999   },
  { key: 'pesadissimo', label: 'Pesadíssimo',       range: 'Sin límite', max: 999   },
  { key: 'absoluto',    label: 'Absoluto',          range: 'Peso libre', max: 999   },
]

function getWeightOptions(genero: string, categoria: string): WeightOption[] | null {
  if (!genero || !categoria || categoria === 'absoluto') return null
  const isJuvenil = categoria === 'juvenil' || categoria === 'kids'
  if (genero === 'masculino') return isJuvenil ? W_MASC_JUVENIL : W_MASC_ADULTO
  if (genero === 'femenino')  return isJuvenil ? W_FEM_JUVENIL  : W_FEM_ADULTO
  return null
}

// ─── Types ────────────────────────────────────────────────────────────────────

type FormFields = {
  nombre_completo: string
  documento:       string
  email:           string
  codigoArea:      string
  telefono:        string
  academia:        string
  ciudad_pais:     string
  genero:          string
  faja:            FajaTipo | ''
  division:        DivisionTipo | ''
  categoria:       CategoriaTipo | ''
  categoria_peso:  string   // key from WeightOption
}

type FieldErrors = Partial<Record<keyof FormFields, string>>
type Status = 'idle' | 'submitting' | 'success' | 'error'

const PAISES = [
  { code: '+598', flag: '🇺🇾', label: '🇺🇾 +598' },
  { code: '+54',  flag: '🇦🇷', label: '🇦🇷 +54'  },
  { code: '+55',  flag: '🇧🇷', label: '🇧🇷 +55'  },
  { code: '+56',  flag: '🇨🇱', label: '🇨🇱 +56'  },
  { code: '+595', flag: '🇵🇾', label: '🇵🇾 +595' },
]

const EMPTY: FormFields = {
  nombre_completo: '',
  documento:       '',
  email:           '',
  codigoArea:      '+598',
  telefono:        '',
  academia:        '',
  ciudad_pais:     '',
  genero:          '',
  faja:            '',
  division:        '',
  categoria:       '',
  categoria_peso:  '',
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const LABEL_STYLE: React.CSSProperties = {
  display:       'block',
  fontFamily:    'var(--font-barlow-condensed), sans-serif',
  fontSize:      '0.72rem',
  fontWeight:    700,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color:         '#8a9ab5',
  marginBottom:  '6px',
}

const BASE_INPUT: React.CSSProperties = {
  width:            '100%',
  background:       'rgba(13,33,68,0.8)',
  border:           '1px solid rgba(42,107,194,0.3)',
  borderRadius:     '2px',
  color:            '#f0f4ff',
  fontFamily:       'var(--font-barlow), sans-serif',
  fontSize:         '1rem',
  padding:          '12px 16px',
  outline:          'none',
  transition:       'border-color 0.2s, box-shadow 0.2s',
  appearance:       'none',
  WebkitAppearance: 'none',
}

const ERROR_TEXT: React.CSSProperties = {
  fontFamily: 'var(--font-barlow), sans-serif',
  fontSize:   '0.75rem',
  color:      '#ef4444',
  marginTop:  '4px',
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
  background:   'rgba(7,20,40,0.6)',
  border:       '1px solid rgba(42,107,194,0.15)',
  padding:      '36px 40px',
  marginBottom: '2px',
}

const GRID_2: React.CSSProperties = {
  display:             'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap:                 '20px',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InscripcionPage() {
  const [form,         setForm]         = useState<FormFields>(EMPTY)
  const [errors,       setErrors]       = useState<FieldErrors>({})
  const [status,       setStatus]       = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [focused,      setFocused]      = useState<string | null>(null)
  const [successName,  setSuccessName]  = useState('')

  const weightOptions = getWeightOptions(form.genero, form.categoria)

  // ── Validation ──────────────────────────────────────────────────────────────

  function validate(): boolean {
    const e: FieldErrors = {}

    if (!form.nombre_completo.trim()) e.nombre_completo = 'Requerido'
    if (!form.documento.trim())       e.documento       = 'Requerido'

    if (!form.email.trim()) {
      e.email = 'Requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Email inválido'
    }

    if (!form.telefono.trim()) e.telefono = 'Requerido'
    if (!form.academia.trim()) e.academia = 'Requerido'
    if (!form.ciudad_pais.trim()) e.ciudad_pais = 'Requerido'
    if (!form.genero)          e.genero   = 'Seleccioná una opción'
    if (!form.faja)            e.faja     = 'Seleccioná una opción'
    if (!form.division)        e.division = 'Seleccioná una opción'
    if (!form.categoria)       e.categoria = 'Seleccioná una opción'

    // Absoluto doesn't need a weight category
    if (form.categoria !== 'absoluto' && !form.categoria_peso) {
      e.categoria_peso = 'Seleccioná una opción'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

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

      // Resolve peso_kg from category
      const opts = getWeightOptions(form.genero, form.categoria)
      const selectedWeight = opts?.find(o => o.key === form.categoria_peso)
      const pesoKg = form.categoria === 'absoluto' ? 999 : (selectedWeight?.max ?? 999)

      const { error: insertErr } = await supabase.from('inscripciones').insert({
        evento_id:      eventos[0].id,
        nombre:         form.nombre_completo.trim(),
        documento:      form.documento.trim(),
        email:          form.email.trim().toLowerCase(),
        telefono:       `${form.codigoArea} ${form.telefono.trim()}`,
        academia:       form.academia.trim(),
        ciudad:         form.ciudad_pais.trim(),
        faja:           form.faja || null,
        division:       form.division,
        categoria:      form.categoria,
        peso_kg:        pesoKg,
        genero:         form.genero,
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

  // ── Field change ─────────────────────────────────────────────────────────────

  function handleChange(ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = ev.target

    // Reset categoria_peso when genero or categoria changes
    if (name === 'genero' || name === 'categoria') {
      setForm(prev => ({ ...prev, [name]: value, categoria_peso: '' }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }

    if (errors[name as keyof FormFields]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  // ── Derived input style ───────────────────────────────────────────────────────

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

  // ── Success view ──────────────────────────────────────────────────────────────

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

        <form onSubmit={handleSubmit} noValidate>

          {/* 01 · Datos personales */}
          <div style={CARD}>
            <div style={SECTION_LABEL}>01 · Datos Personales</div>
            <div style={GRID_2}>

              <Field label="Nombre completo" error={errors.nombre_completo}>
                <input
                  name="nombre_completo" type="text" required
                  placeholder="Juan García"
                  value={form.nombre_completo} onChange={handleChange}
                  style={inputStyle('nombre_completo')} {...fp('nombre_completo')}
                />
              </Field>

              {/* CI / DNI / Pasaporte — no numeric restriction (passports have letters) */}
              <Field label="CI / DNI / Pasaporte" error={errors.documento}>
                <input
                  name="documento" type="text" required
                  placeholder="Ej: 1.234.567-8 o AB123456"
                  value={form.documento} onChange={handleChange}
                  style={inputStyle('documento')} {...fp('documento')}
                />
              </Field>

              <Field label="Email" error={errors.email}>
                <input
                  name="email" type="email" required
                  placeholder="juan@email.com"
                  value={form.email} onChange={handleChange}
                  style={inputStyle('email')} {...fp('email')}
                />
              </Field>

              {/* Phone with country code selector */}
              <Field label="Teléfono" error={errors.telefono}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    name="codigoArea"
                    value={form.codigoArea}
                    onChange={handleChange}
                    style={{
                      ...BASE_INPUT,
                      width:       'auto',
                      minWidth:    '100px',
                      flexShrink:  0,
                      cursor:      'pointer',
                      borderColor: focused === 'codigoArea' ? '#c9a227' : 'rgba(42,107,194,0.3)',
                      boxShadow:   focused === 'codigoArea' ? '0 0 0 1px rgba(201,162,39,0.15)' : 'none',
                      padding:     '12px 10px',
                    }}
                    {...fp('codigoArea')}
                  >
                    {PAISES.map(p => (
                      <option key={p.code} value={p.code}>{p.label}</option>
                    ))}
                  </select>
                  <input
                    name="telefono" type="tel" required
                    inputMode="numeric" pattern="[0-9]*"
                    placeholder="99 123 456"
                    value={form.telefono} onChange={handleChange}
                    onKeyDown={e => {
                      if (!/[0-9]/.test(e.key) && !['Backspace','Delete','Tab','ArrowLeft','ArrowRight',' '].includes(e.key))
                        e.preventDefault()
                    }}
                    style={{ ...inputStyle('telefono'), flex: 1 }}
                    {...fp('telefono')}
                  />
                </div>
              </Field>

            </div>
          </div>

          {/* 02 · Academia */}
          <div style={CARD}>
            <div style={SECTION_LABEL}>02 · Academia y Procedencia</div>
            <div style={GRID_2}>
              <Field label="Academia" error={errors.academia}>
                <input
                  name="academia" type="text" required
                  placeholder="Nombre de tu equipo"
                  value={form.academia} onChange={handleChange}
                  style={inputStyle('academia')} {...fp('academia')}
                />
              </Field>
              <Field label="Ciudad / País" error={errors.ciudad_pais}>
                <input
                  name="ciudad_pais" type="text" required
                  placeholder="Montevideo, Uruguay"
                  value={form.ciudad_pais} onChange={handleChange}
                  style={inputStyle('ciudad_pais')} {...fp('ciudad_pais')}
                />
              </Field>
            </div>
          </div>

          {/* 03 · Categoría */}
          <div style={{ ...CARD, marginBottom: '24px' }}>
            <div style={SECTION_LABEL}>03 · Categoría</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px' }}>

              {/* Faixa (was "Faja") */}
              <Field label="Faixa" error={errors.faja}>
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

              <Field label="Género" error={errors.genero}>
                <select name="genero" required value={form.genero} onChange={handleChange} style={{ ...inputStyle('genero'), cursor: 'pointer' }} {...fp('genero')}>
                  <option value="" disabled>Seleccioná</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
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

              {/* Peso por categoría — dinámico según género y categoría */}
              <div style={{ gridColumn: form.categoria === 'absoluto' ? 'auto' : 'span 2' }}>
                <Field label="Categoría de Peso" error={errors.categoria_peso}>
                  {form.categoria === 'absoluto' ? (
                    <div style={{ ...BASE_INPUT, color: '#8a9ab5', cursor: 'default' }}>
                      Absoluto — Peso libre
                    </div>
                  ) : !weightOptions ? (
                    <div style={{ ...BASE_INPUT, color: '#8a9ab5', cursor: 'default', fontSize: '0.85rem' }}>
                      Seleccioná género y categoría primero
                    </div>
                  ) : (
                    <select
                      name="categoria_peso"
                      required
                      value={form.categoria_peso}
                      onChange={handleChange}
                      style={{ ...inputStyle('categoria_peso'), cursor: 'pointer' }}
                      {...fp('categoria_peso')}
                    >
                      <option value="" disabled>Seleccioná categoría de peso</option>
                      {weightOptions.map(opt => (
                        <option key={opt.key} value={opt.key}>
                          {opt.label} — {opt.range}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
              </div>

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
              width:         '100%',
              background:    status === 'submitting' ? 'rgba(201,162,39,0.5)' : '#c9a227',
              color:         '#050810',
              fontFamily:    'var(--font-barlow-condensed), sans-serif',
              fontSize:      '1.1rem',
              fontWeight:    900,
              letterSpacing: '4px',
              textTransform: 'uppercase',
              border:        'none',
              padding:       '20px',
              borderRadius:  '2px',
              cursor:        status === 'submitting' ? 'not-allowed' : 'pointer',
              transition:    'background 0.2s',
            }}
          >
            {status === 'submitting' ? 'ENVIANDO...' : 'CONFIRMAR INSCRIPCIÓN'}
          </button>

        </form>

        {/* Reglamento */}
        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid rgba(42,107,194,0.15)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: '#8a9ab5', marginBottom: '12px' }}>
            Reglamento
          </div>
          <p style={{ fontFamily: 'var(--font-barlow), sans-serif', fontSize: '0.88rem', color: '#8a9ab5', lineHeight: 1.7, marginBottom: '12px' }}>
            El torneo se rige por el reglamento oficial de la IBJJF (International Brazilian Jiu-Jitsu Federation).
          </p>
          <a
            href="https://ibjjf.com/rules/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display:       'inline-flex',
              alignItems:    'center',
              gap:           '6px',
              color:         '#c9a227',
              fontFamily:    'var(--font-barlow-condensed), sans-serif',
              fontSize:      '0.82rem',
              fontWeight:    700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              textDecoration: 'none',
              border:        '1px solid rgba(201,162,39,0.3)',
              padding:       '10px 20px',
              borderRadius:  '2px',
              transition:    'border-color 0.2s, color 0.2s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            Ver Reglamento IBJJF
          </a>
        </div>

      </div>
    </main>
  )
}

// ─── Field wrapper ─────────────────────────────────────────────────────────────

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
