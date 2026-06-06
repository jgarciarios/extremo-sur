'use client'

import { useState, useEffect, useRef } from 'react'
import type { FajaTipo, DivisionTipo, CategoriaTipo } from '@/lib/types'
import { AppHeader } from '@/components/AppHeader'
import { createClient } from '@/lib/supabase/client'

// ─── Ciudad autocomplete ──────────────────────────────────────────────────────

const CIUDADES = [
  // Uruguay
  'Montevideo, Uruguay', 'Maldonado, Uruguay', 'Punta del Este, Uruguay',
  'Canelones, Uruguay', 'San José, Uruguay', 'Colonia del Sacramento, Uruguay',
  'Salto, Uruguay', 'Paysandú, Uruguay', 'Rivera, Uruguay', 'Melo, Uruguay',
  'Rocha, Uruguay', 'Tacuarembó, Uruguay', 'Durazno, Uruguay', 'Trinidad, Uruguay',
  'Mercedes, Uruguay', 'Artigas, Uruguay', 'Minas, Uruguay', 'Treinta y Tres, Uruguay',
  // Argentina
  'Buenos Aires, Argentina', 'Córdoba, Argentina', 'Rosario, Argentina',
  'Mendoza, Argentina', 'La Plata, Argentina', 'Mar del Plata, Argentina',
  'San Miguel de Tucumán, Argentina', 'Salta, Argentina', 'Santa Fe, Argentina',
  'San Juan, Argentina', 'Resistencia, Argentina', 'Corrientes, Argentina',
  'Posadas, Argentina', 'Neuquén, Argentina', 'Bahía Blanca, Argentina',
  'San Luis, Argentina', 'Paraná, Argentina', 'Formosa, Argentina',
  'San Salvador de Jujuy, Argentina', 'Santiago del Estero, Argentina',
  'Catamarca, Argentina', 'La Rioja, Argentina', 'Rawson, Argentina',
  // Brasil
  'São Paulo, Brasil', 'Rio de Janeiro, Brasil', 'Brasília, Brasil',
  'Salvador, Brasil', 'Fortaleza, Brasil', 'Belo Horizonte, Brasil',
  'Manaus, Brasil', 'Curitiba, Brasil', 'Recife, Brasil', 'Porto Alegre, Brasil',
  'Belém, Brasil', 'Goiânia, Brasil', 'Florianópolis, Brasil', 'Natal, Brasil',
  'Campo Grande, Brasil', 'Maceió, Brasil', 'João Pessoa, Brasil',
  'Teresina, Brasil', 'São Luís, Brasil', 'Cuiabá, Brasil',
  // Paraguay
  'Asunción, Paraguay', 'Ciudad del Este, Paraguay', 'San Lorenzo, Paraguay',
  'Luque, Paraguay', 'Capiatá, Paraguay', 'Lambaré, Paraguay',
  'Fernando de la Mora, Paraguay', 'Encarnación, Paraguay',
  // Chile
  'Santiago, Chile', 'Valparaíso, Chile', 'Concepción, Chile',
  'La Serena, Chile', 'Antofagasta, Chile', 'Temuco, Chile',
  'Rancagua, Chile', 'Talca, Chile', 'Arica, Chile', 'Iquique, Chile',
  // Bolivia
  'La Paz, Bolivia', 'Santa Cruz de la Sierra, Bolivia', 'Cochabamba, Bolivia',
  'Sucre, Bolivia', 'Oruro, Bolivia', 'Potosí, Bolivia',
  // Perú
  'Lima, Perú', 'Arequipa, Perú', 'Trujillo, Perú', 'Chiclayo, Perú',
  'Cusco, Perú', 'Iquitos, Perú',
  // Colombia
  'Bogotá, Colombia', 'Medellín, Colombia', 'Cali, Colombia',
  'Barranquilla, Colombia', 'Cartagena, Colombia', 'Cúcuta, Colombia',
  // Ecuador
  'Quito, Ecuador', 'Guayaquil, Ecuador', 'Cuenca, Ecuador',
  // Venezuela
  'Caracas, Venezuela', 'Maracaibo, Venezuela', 'Valencia, Venezuela',
  // España
  'Madrid, España', 'Barcelona, España', 'Valencia, España',
  'Sevilla, España', 'Zaragoza, España', 'Málaga, España',
  // México
  'Ciudad de México, México', 'Guadalajara, México', 'Monterrey, México',
  'Tijuana, México', 'Cancún, México',
  // Estados Unidos
  'Miami, Estados Unidos', 'Nueva York, Estados Unidos', 'Los Ángeles, Estados Unidos',
  'Chicago, Estados Unidos', 'Houston, Estados Unidos',
]

type CiudadAutocompleteProps = {
  value:    string
  onChange: (val: string) => void
  style:    React.CSSProperties
  onFocus:  () => void
  onBlur:   () => void
  error:    boolean
}

function CiudadAutocomplete({ value, onChange, style, onFocus, onBlur, error }: CiudadAutocompleteProps) {
  const [open,    setOpen]    = useState(false)
  const [hiIdx,   setHiIdx]   = useState(0)
  const containerRef          = useRef<HTMLDivElement>(null)

  const matches = value.trim().length >= 2
    ? CIUDADES.filter(c => c.toLowerCase().includes(value.toLowerCase())).slice(0, 8)
    : []

  // Cerrar si click fuera
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || matches.length === 0) return
    if (e.key === 'ArrowDown')  { e.preventDefault(); setHiIdx(i => Math.min(i + 1, matches.length - 1)) }
    if (e.key === 'ArrowUp')    { e.preventDefault(); setHiIdx(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter')      { e.preventDefault(); select(matches[hiIdx]) }
    if (e.key === 'Escape')     setOpen(false)
  }

  function select(city: string) {
    onChange(city)
    setOpen(false)
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        type="text"
        autoComplete="off"
        placeholder="Montevideo, Uruguay"
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); setHiIdx(0) }}
        onFocus={() => { onFocus(); setOpen(true) }}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        style={style}
      />
      {open && matches.length > 0 && (
        <ul style={{
          position:       'absolute',
          top:            'calc(100% + 4px)',
          left:           0,
          right:          0,
          zIndex:         50,
          background:     '#071428',
          border:         `1px solid ${error ? '#ef4444' : 'rgba(201,162,39,0.35)'}`,
          borderRadius:   '2px',
          listStyle:      'none',
          margin:         0,
          padding:        '4px 0',
          maxHeight:      '220px',
          overflowY:      'auto',
          boxShadow:      '0 8px 32px rgba(0,0,0,0.6)',
        }}>
          {matches.map((city, i) => (
            <li
              key={city}
              onMouseDown={e => { e.preventDefault(); select(city) }}
              style={{
                padding:    '10px 16px',
                cursor:     'pointer',
                fontFamily: 'var(--font-barlow), sans-serif',
                fontSize:   '0.9rem',
                color:      i === hiIdx ? '#c9a227' : '#f0f4ff',
                background: i === hiIdx ? 'rgba(201,162,39,0.08)' : 'transparent',
                transition: 'background 0.1s',
              }}
              onMouseEnter={() => setHiIdx(i)}
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── IBJJF Weight table ───────────────────────────────────────────────────────

type WeightOption = { key: string; label: string; range: string; max: number }

const W_MASC_JUVENIL: WeightOption[] = [
  { key: 'galo',        label: 'Galo',         range: '≤ 53.5 kg',  max: 53.5  },
  { key: 'pluma',       label: 'Pluma',        range: '≤ 58.5 kg',  max: 58.5  },
  { key: 'pena',        label: 'Pena',         range: '≤ 64 kg',    max: 64    },
  { key: 'leve',        label: 'Leve',         range: '≤ 69 kg',    max: 69    },
  { key: 'medio',       label: 'Médio',        range: '≤ 74 kg',    max: 74    },
  { key: 'meiopes',     label: 'Meio-pesado',  range: '≤ 79.3 kg',  max: 79.3  },
  { key: 'pesado',      label: 'Pesado',       range: '≤ 84.3 kg',  max: 84.3  },
  { key: 'superpesado', label: 'Super-pesado', range: '≤ 89.3 kg',  max: 89.3  },
  { key: 'pesadissimo', label: 'Pesadíssimo',  range: 'Sin límite', max: 999   },
  { key: 'absoluto',    label: 'Absoluto',     range: 'Peso libre', max: 999   },
]

const W_MASC_ADULTO: WeightOption[] = [
  { key: 'galo',        label: 'Galo',         range: '≤ 57.5 kg',  max: 57.5  },
  { key: 'pluma',       label: 'Pluma',        range: '≤ 64 kg',    max: 64    },
  { key: 'pena',        label: 'Pena',         range: '≤ 70 kg',    max: 70    },
  { key: 'leve',        label: 'Leve',         range: '≤ 76 kg',    max: 76    },
  { key: 'medio',       label: 'Médio',        range: '≤ 82.3 kg',  max: 82.3  },
  { key: 'meiopes',     label: 'Meio-pesado',  range: '≤ 88.3 kg',  max: 88.3  },
  { key: 'pesado',      label: 'Pesado',       range: '≤ 94.3 kg',  max: 94.3  },
  { key: 'superpesado', label: 'Super-pesado', range: '≤ 100.5 kg', max: 100.5 },
  { key: 'pesadissimo', label: 'Pesadíssimo',  range: 'Sin límite', max: 999   },
  { key: 'absoluto',    label: 'Absoluto',     range: 'Peso libre', max: 999   },
]

const W_FEM_JUVENIL: WeightOption[] = [
  { key: 'galo',        label: 'Galo',         range: '≤ 44.3 kg',  max: 44.3  },
  { key: 'pluma',       label: 'Pluma',        range: '≤ 48.3 kg',  max: 48.3  },
  { key: 'pena',        label: 'Pena',         range: '≤ 52.5 kg',  max: 52.5  },
  { key: 'leve',        label: 'Leve',         range: '≤ 56.5 kg',  max: 56.5  },
  { key: 'medio',       label: 'Médio',        range: '≤ 60.5 kg',  max: 60.5  },
  { key: 'meiopes',     label: 'Meio-pesado',  range: '≤ 65 kg',    max: 65    },
  { key: 'pesado',      label: 'Pesado',       range: '≤ 69 kg',    max: 69    },
  { key: 'superpesado', label: 'Super-pesado', range: 'Sin límite', max: 999   },
  { key: 'pesadissimo', label: 'Pesadíssimo',  range: 'Sin límite', max: 999   },
  { key: 'absoluto',    label: 'Absoluto',     range: 'Peso libre', max: 999   },
]

const W_FEM_ADULTO: WeightOption[] = [
  { key: 'galo',        label: 'Galo',         range: '≤ 45.5 kg',  max: 45.5  },
  { key: 'pluma',       label: 'Pluma',        range: '≤ 53.5 kg',  max: 53.5  },
  { key: 'pena',        label: 'Pena',         range: '≤ 58.5 kg',  max: 58.5  },
  { key: 'leve',        label: 'Leve',         range: '≤ 64 kg',    max: 64    },
  { key: 'medio',       label: 'Médio',        range: '≤ 69 kg',    max: 69    },
  { key: 'meiopes',     label: 'Meio-pesado',  range: '≤ 74 kg',    max: 74    },
  { key: 'pesado',      label: 'Pesado',       range: '≤ 79.3 kg',  max: 79.3  },
  { key: 'superpesado', label: 'Super-pesado', range: 'Sin límite', max: 999   },
  { key: 'pesadissimo', label: 'Pesadíssimo',  range: 'Sin límite', max: 999   },
  { key: 'absoluto',    label: 'Absoluto',     range: 'Peso libre', max: 999   },
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
  categoria_peso:  string
}

type FieldErrors = Partial<Record<keyof FormFields, string>>
type Status = 'idle' | 'submitting' | 'success' | 'error'

type Countdown = { d: number; h: number; m: number; s: number; passed: boolean }

const PAISES = [
  { code: '+598', label: '🇺🇾 +598' },
  { code: '+54',  label: '🇦🇷 +54'  },
  { code: '+55',  label: '🇧🇷 +55'  },
  { code: '+56',  label: '🇨🇱 +56'  },
  { code: '+595', label: '🇵🇾 +595' },
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

const EVENT_DATE = '2026-08-23T09:00:00-03:00'

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

const GRID_2: React.CSSProperties = {
  display:             'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap:                 '20px',
  marginBottom:        '32px',
}

// ─── useCountdown ─────────────────────────────────────────────────────────────

function useCountdown(isoTarget: string): Countdown {
  const [cd, setCd] = useState<Countdown>({ d: 0, h: 0, m: 0, s: 0, passed: false })

  useEffect(() => {
    function tick() {
      const diff = new Date(isoTarget).getTime() - Date.now()
      if (diff <= 0) { setCd({ d: 0, h: 0, m: 0, s: 0, passed: true }); return }
      setCd({
        d:      Math.floor(diff / 86400000),
        h:      Math.floor((diff % 86400000) / 3600000),
        m:      Math.floor((diff % 3600000)  / 60000),
        s:      Math.floor((diff % 60000)    / 1000),
        passed: false,
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [isoTarget])

  return cd
}

// ─── Main component ───────────────────────────────────────────────────────────

// ─── Datos de pago — actualizar con datos reales de Ricardo ──────────────────
const PAGO_ALIAS  = 'extremosurbjj'       // ← reemplazar con alias real
const PAGO_BANCO  = 'BROU'                // ← reemplazar con banco real
const PAGO_MONTO  = 'a confirmar'         // ← reemplazar con monto real (ej: '$900 UYU')

export default function InscripcionPage() {
  const [step,              setStep]              = useState(1)
  const [form,              setForm]              = useState<FormFields>(EMPTY)
  const [errors,            setErrors]            = useState<FieldErrors>({})
  const [status,            setStatus]            = useState<Status>('idle')
  const [errorMessage,      setErrorMessage]      = useState('')
  const [focused,           setFocused]           = useState<string | null>(null)
  const [successData,       setSuccessData]       = useState<FormFields | null>(null)
  const [comprobante,       setComprobante]       = useState<File | null>(null)
  const [comprobanteUrl,    setComprobanteUrl]    = useState<string | null>(null)
  const [uploadingComp,     setUploadingComp]     = useState(false)
  const [comprobanteError,  setComprobanteError]  = useState('')
  const countdown     = useCountdown(EVENT_DATE)
  const weightOptions = getWeightOptions(form.genero, form.categoria)

  // ── Per-step validation ─────────────────────────────────────────────────────

  function validateStep(s: number): boolean {
    const e: FieldErrors = {}

    if (s === 1) {
      if (!form.nombre_completo.trim()) e.nombre_completo = 'Requerido'
      if (!form.documento.trim())       e.documento       = 'Requerido'
      if (!form.email.trim())           e.email           = 'Requerido'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido'
      if (!form.telefono.trim())        e.telefono        = 'Requerido'
    }

    if (s === 2) {
      if (!form.academia.trim())    e.academia    = 'Requerido'
      if (!form.ciudad_pais.trim()) e.ciudad_pais = 'Requerido'
    }

    if (s === 3) {
      if (!form.genero)    e.genero    = 'Seleccioná una opción'
      if (!form.faja)      e.faja      = 'Seleccioná una opción'
      if (!form.division)  e.division  = 'Seleccioná una opción'
      if (!form.categoria) e.categoria = 'Seleccioná una opción'
      if (form.categoria !== 'absoluto' && !form.categoria_peso)
        e.categoria_peso = 'Seleccioná una opción'
    }

    // Step 4 — comprobante obligatorio
    if (s === 4 && !comprobanteUrl) {
      setComprobanteError('Tenés que subir el comprobante de pago para confirmar la inscripción.')
      return false
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  function nextStep() {
    if (validateStep(step)) { setErrors({}); setStep(s => s + 1) }
  }

  function prevStep() {
    setErrors({})
    setStep(s => s - 1)
  }

  // ── Upload comprobante a Supabase Storage ────────────────────────────────────

  async function handleComprobanteChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setComprobanteError('')

    // Validar tipo y tamaño (máx 8MB)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      setComprobanteError('Solo se aceptan imágenes (JPG, PNG) o PDF.')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setComprobanteError('El archivo no puede superar 8MB.')
      return
    }

    setComprobante(file)
    setUploadingComp(true)

    try {
      const supabase = createClient()
      const ext      = file.name.split('.').pop()
      const path     = `${crypto.randomUUID()}.${ext}`
      const { error } = await supabase.storage
        .from('comprobantes')
        .upload(path, file, { contentType: file.type })

      if (error) throw error

      const { data: urlData } = supabase.storage
        .from('comprobantes')
        .getPublicUrl(path)

      setComprobanteUrl(urlData.publicUrl)
    } catch {
      setComprobanteError('Error al subir el archivo. Intentá de nuevo.')
      setComprobante(null)
    } finally {
      setUploadingComp(false)
    }
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validateStep(4)) return

    setStatus('submitting')
    setErrorMessage('')

    try {
      const opts   = getWeightOptions(form.genero, form.categoria)
      const wOpt   = opts?.find(o => o.key === form.categoria_peso)
      const pesoKg = form.categoria === 'absoluto' ? 999 : (wOpt?.max ?? 999)

      const res = await fetch('/api/inscripcion', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre:          form.nombre_completo.trim(),
          documento:       form.documento.trim(),
          email:           form.email.trim().toLowerCase(),
          telefono:        `${form.codigoArea} ${form.telefono.trim()}`,
          academia:        form.academia.trim(),
          ciudad:          form.ciudad_pais.trim(),
          faja:            form.faja || null,
          division:        form.division,
          categoria:       form.categoria,
          peso_kg:         pesoKg,
          genero:          form.genero,
          comprobante_url: comprobanteUrl,
          _trap:           '',
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error inesperado.')

      setSuccessData({ ...form })
      setStatus('success')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error inesperado. Intentá de nuevo.')
      setStatus('error')
    }
  }

  // ── Field change ─────────────────────────────────────────────────────────────

  function handleChange(ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = ev.target
    if (name === 'genero' || name === 'categoria') {
      setForm(prev => ({ ...prev, [name]: value, categoria_peso: '' }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
    if (errors[name as keyof FormFields])
      setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  function iStyle(name: string): React.CSSProperties {
    const err = !!errors[name as keyof FormFields]
    return {
      ...BASE_INPUT,
      borderColor: err ? '#ef4444' : focused === name ? '#c9a227' : 'rgba(42,107,194,0.3)',
      boxShadow:   !err && focused === name ? '0 0 0 1px rgba(201,162,39,0.15)' : 'none',
    }
  }

  function fp(name: string) {
    return { onFocus: () => setFocused(name), onBlur: () => setFocused(null) }
  }

  // ── Success view ─────────────────────────────────────────────────────────────

  if (status === 'success' && successData) {
    return <SuccessScreen data={successData} countdown={countdown} />
  }

  // ── Countdown string ──────────────────────────────────────────────────────────

  const pad = (n: number) => String(n).padStart(2, '0')
  const cdStr = countdown.passed
    ? '¡HOY ES EL DÍA!'
    : `${countdown.d}D ${pad(countdown.h)}H ${pad(countdown.m)}M ${pad(countdown.s)}S`

  // ── Form view ─────────────────────────────────────────────────────────────────

  return (
    <main style={{ minHeight: '100vh', background: '#050810', color: '#f0f4ff' }}>
      <AppHeader active="inscripcion" />

      {/* ── Stats bar ── */}
      <div style={{
        background:    'rgba(5,8,16,0.98)',
        borderBottom:  '1px solid rgba(201,162,39,0.2)',
        marginTop:     '64px',
        padding:       '0 24px',
        display:       'flex',
        justifyContent:'center',
        alignItems:    'stretch',
        gap:           '0',
        overflowX:     'auto',
      }}>
        <StatPill>
          <span style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: '1.1rem', color: '#e8c14a', letterSpacing: '2px', lineHeight: 1 }}>
            {cdStr}
          </span>
          <span style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '2px', color: '#8a9ab5', textTransform: 'uppercase' }}>
            Para el evento
          </span>
        </StatPill>
        <Divider />
        <StatPill>
          <span style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '2px', color: '#f0f4ff', textTransform: 'uppercase' }}>
            23 Agosto 2026 · AJP Uruguay
          </span>
          <span style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '2px', color: '#8a9ab5', textTransform: 'uppercase' }}>
            Maldonado, Uruguay
          </span>
        </StatPill>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '56px 24px 64px' }}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '6px', textTransform: 'uppercase', color: '#c9a227', marginBottom: '10px' }}>
            Extremo Sur BJJ · AJP Uruguay 2026
          </div>
          <h1 style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: 'clamp(3.2rem, 10vw, 6rem)', letterSpacing: '4px', lineHeight: 0.9, margin: 0 }}>
            INSCRIPCIÓN
          </h1>
          <div style={{ width: '60px', height: '2px', background: 'linear-gradient(90deg, transparent, #c9a227, transparent)', margin: '14px auto 0' }} />
        </div>

        {/* ── Progress indicator ── */}
        <ProgressBar step={step} />

        {/* ── Multi-step slider ── */}
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              display:    'flex',
              width:      '400%',
              transform:  `translateX(${(step - 1) * (-100 / 4)}%)`,
              transition: 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}>

              {/* ─ STEP 1: Datos personales ─ */}
              <div style={{ width: '25%', padding: '0' }}>
                <div style={{ background: 'rgba(7,20,40,0.7)', border: '1px solid rgba(42,107,194,0.2)', padding: '36px 40px 28px' }}>
                  <StepHeader number="01" title="Datos Personales" subtitle="Información del competidor" />
                  <div style={GRID_2}>
                    <Field label="Nombre completo" error={errors.nombre_completo}>
                      <input name="nombre_completo" type="text" required placeholder="Juan García"
                        value={form.nombre_completo} onChange={handleChange}
                        style={iStyle('nombre_completo')} {...fp('nombre_completo')} />
                    </Field>
                    <Field label="CI / DNI / Pasaporte" error={errors.documento}>
                      <input name="documento" type="text" required placeholder="1.234.567-8 ó AB123456"
                        value={form.documento} onChange={handleChange}
                        style={iStyle('documento')} {...fp('documento')} />
                    </Field>
                    <Field label="Email" error={errors.email}>
                      <input name="email" type="email" required placeholder="juan@email.com"
                        value={form.email} onChange={handleChange}
                        style={iStyle('email')} {...fp('email')} />
                    </Field>
                    <Field label="Teléfono" error={errors.telefono}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select name="codigoArea" value={form.codigoArea} onChange={handleChange}
                          style={{ ...BASE_INPUT, width: 'auto', minWidth: '100px', flexShrink: 0, cursor: 'pointer', padding: '12px 10px', borderColor: focused === 'codigoArea' ? '#c9a227' : 'rgba(42,107,194,0.3)' }}
                          {...fp('codigoArea')}>
                          {PAISES.map(p => <option key={p.code} value={p.code}>{p.label}</option>)}
                        </select>
                        <input name="telefono" type="tel" required inputMode="numeric" pattern="[0-9]*"
                          placeholder="99 123 456" value={form.telefono} onChange={handleChange}
                          onKeyDown={e => { if (!/[0-9]/.test(e.key) && !['Backspace','Delete','Tab','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault() }}
                          style={{ ...iStyle('telefono'), flex: 1 }} {...fp('telefono')} />
                      </div>
                    </Field>
                  </div>
                  <StepNav step={step} onNext={nextStep} onPrev={prevStep} submitting={false} />
                </div>
              </div>

              {/* ─ STEP 2: Academia ─ */}
              <div style={{ width: '25%', padding: '0' }}>
                <div style={{ background: 'rgba(7,20,40,0.7)', border: '1px solid rgba(42,107,194,0.2)', padding: '36px 40px 28px' }}>
                  <StepHeader number="02" title="Academia y Procedencia" subtitle="¿De dónde venís?" />
                  <div style={{ ...GRID_2 }}>
                    <Field label="Academia" error={errors.academia}>
                      <input name="academia" type="text" required placeholder="Nombre de tu equipo"
                        value={form.academia} onChange={handleChange}
                        style={iStyle('academia')} {...fp('academia')} />
                    </Field>
                    <Field label="Ciudad / País" error={errors.ciudad_pais}>
                      <CiudadAutocomplete
                        value={form.ciudad_pais}
                        onChange={val => {
                          setForm(prev => ({ ...prev, ciudad_pais: val }))
                          if (errors.ciudad_pais) setErrors(prev => ({ ...prev, ciudad_pais: undefined }))
                        }}
                        style={iStyle('ciudad_pais')}
                        onFocus={() => setFocused('ciudad_pais')}
                        onBlur={() => setFocused(null)}
                        error={!!errors.ciudad_pais}
                      />
                    </Field>
                  </div>
                  <StepNav step={step} onNext={nextStep} onPrev={prevStep} submitting={false} />
                </div>
              </div>

              {/* ─ STEP 3: Categoría ─ */}
              <div style={{ width: '25%', padding: '0' }}>
                <div style={{ background: 'rgba(7,20,40,0.7)', border: '1px solid rgba(42,107,194,0.2)', padding: '36px 40px 28px' }}>
                  <StepHeader number="03" title="Tu Categoría" subtitle="Dónde vas a competir" />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: '20px', marginBottom: '24px' }}>

                    <Field label="Faixa" error={errors.faja}>
                      <select name="faja" required value={form.faja} onChange={handleChange}
                        style={{ ...iStyle('faja'), cursor: 'pointer' }} {...fp('faja')}>
                        <option value="" disabled>Seleccioná</option>
                        <option value="blanca">Blanca</option>
                        <option value="azul">Azul</option>
                        <option value="morada">Morada</option>
                        <option value="marron">Marrón</option>
                        <option value="negra">Negra</option>
                      </select>
                    </Field>

                    <Field label="División" error={errors.division}>
                      <select name="division" required value={form.division} onChange={handleChange}
                        style={{ ...iStyle('division'), cursor: 'pointer' }} {...fp('division')}>
                        <option value="" disabled>Seleccioná</option>
                        <option value="gi">Gi</option>
                        <option value="nogi">No-Gi</option>
                        <option value="ambas">Ambas</option>
                      </select>
                    </Field>

                    <Field label="Género" error={errors.genero}>
                      <select name="genero" required value={form.genero} onChange={handleChange}
                        style={{ ...iStyle('genero'), cursor: 'pointer' }} {...fp('genero')}>
                        <option value="" disabled>Seleccioná</option>
                        <option value="masculino">Masculino</option>
                        <option value="femenino">Femenino</option>
                      </select>
                    </Field>

                    <Field label="Categoría" error={errors.categoria}>
                      <select name="categoria" required value={form.categoria} onChange={handleChange}
                        style={{ ...iStyle('categoria'), cursor: 'pointer' }} {...fp('categoria')}>
                        <option value="" disabled>Seleccioná</option>
                        <option value="kids">Kids</option>
                        <option value="juvenil">Juvenil</option>
                        <option value="adulto">Adulto</option>
                        <option value="master">Master</option>
                        <option value="absoluto">Absoluto</option>
                      </select>
                    </Field>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <Field label="Categoría de Peso" error={errors.categoria_peso}>
                        {form.categoria === 'absoluto' ? (
                          <div style={{ ...BASE_INPUT, color: '#8a9ab5', cursor: 'default', display: 'flex', alignItems: 'center' }}>
                            Absoluto — Peso libre
                          </div>
                        ) : !weightOptions ? (
                          <div style={{ ...BASE_INPUT, color: '#4a5a70', cursor: 'default', fontSize: '0.875rem', display: 'flex', alignItems: 'center' }}>
                            Seleccioná género y categoría primero
                          </div>
                        ) : (
                          <select name="categoria_peso" required value={form.categoria_peso} onChange={handleChange}
                            style={{ ...iStyle('categoria_peso'), cursor: 'pointer' }} {...fp('categoria_peso')}>
                            <option value="" disabled>Seleccioná tu categoría de peso</option>
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

                  {status === 'error' && (
                    <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)', color: '#ef4444', padding: '12px 16px', fontFamily: 'var(--font-barlow), sans-serif', fontSize: '0.875rem', marginBottom: '20px', borderRadius: '2px' }}>
                      {errorMessage}
                    </div>
                  )}

                  <StepNav step={step} onNext={nextStep} onPrev={prevStep} submitting={false} />
                </div>
              </div>

              {/* ─ STEP 4: Pago ─ */}
              <div style={{ width: '25%', padding: '0' }}>
                <div style={{ background: 'rgba(7,20,40,0.7)', border: '1px solid rgba(42,107,194,0.2)', padding: '36px 40px 28px' }}>
                  <StepHeader number="04" title="Confirmá tu pago" subtitle="Transferí y subí el comprobante" />

                  {/* Instrucciones de pago */}
                  <div style={{ background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(201,162,39,0.25)', borderRadius: '2px', padding: '24px 28px', marginBottom: '28px' }}>
                    <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: '#c9a227', marginBottom: '16px' }}>
                      Datos de transferencia
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { label: 'Banco',   value: PAGO_BANCO  },
                        { label: 'Alias',   value: PAGO_ALIAS  },
                        { label: 'Monto',   value: PAGO_MONTO  },
                        { label: 'Concepto',value: 'Tu nombre completo' },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid rgba(42,107,194,0.1)' }}>
                          <span style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#8a9ab5' }}>
                            {label}
                          </span>
                          <span style={{ fontFamily: 'var(--font-barlow), sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#f0f4ff' }}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upload comprobante */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#8a9ab5', marginBottom: '10px' }}>
                      Comprobante de transferencia *
                    </label>

                    <label style={{
                      display:       'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap:           '8px', padding: '28px 20px',
                      background:    comprobanteUrl ? 'rgba(34,197,94,0.08)' : 'rgba(13,33,68,0.6)',
                      border:        `2px dashed ${comprobanteUrl ? 'rgba(34,197,94,0.6)' : comprobanteError ? '#ef4444' : 'rgba(42,107,194,0.35)'}`,
                      borderRadius:  '2px', cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={handleComprobanteChange}
                        style={{ display: 'none' }}
                      />
                      {uploadingComp ? (
                        <span style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.85rem', color: '#8a9ab5', letterSpacing: '1px' }}>
                          Subiendo...
                        </span>
                      ) : comprobanteUrl ? (
                        <>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          <span style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.85rem', color: '#22c55e', fontWeight: 700, letterSpacing: '1px' }}>
                            {comprobante?.name ?? 'Comprobante subido'}
                          </span>
                          <span style={{ fontFamily: 'var(--font-barlow), sans-serif', fontSize: '0.75rem', color: '#8a9ab5' }}>
                            Clic para cambiar
                          </span>
                        </>
                      ) : (
                        <>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8a9ab5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                          <span style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.85rem', color: '#8a9ab5', letterSpacing: '1px' }}>
                            Subí la foto o PDF del comprobante
                          </span>
                          <span style={{ fontFamily: 'var(--font-barlow), sans-serif', fontSize: '0.72rem', color: '#4a5a70' }}>
                            JPG, PNG o PDF · máx 8MB
                          </span>
                        </>
                      )}
                    </label>

                    {comprobanteError && (
                      <p style={{ fontFamily: 'var(--font-barlow), sans-serif', fontSize: '0.75rem', color: '#ef4444', marginTop: '6px' }}>
                        {comprobanteError}
                      </p>
                    )}
                  </div>

                  {status === 'error' && (
                    <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)', color: '#ef4444', padding: '12px 16px', fontSize: '0.875rem', marginBottom: '20px', borderRadius: '2px' }}>
                      {errorMessage}
                    </div>
                  )}

                  <StepNav step={step} onNext={nextStep} onPrev={prevStep} submitting={status === 'submitting'} isLastStep />
                </div>
              </div>

            </div>
          </div>
        </form>

        {/* ── Reglamento ── */}
        <div style={{ marginTop: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '3px', color: '#4a5a70', textTransform: 'uppercase' }}>
            Reglamento oficial
          </span>
          <a href="https://ibjjf.com/rules/" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#8a9ab5', fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none', border: '1px solid rgba(42,107,194,0.2)', padding: '8px 16px', borderRadius: '2px', transition: 'color 0.2s, border-color 0.2s' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            IBJJF Rules
          </a>
        </div>

      </div>
    </main>
  )
}

// ─── Success Screen ───────────────────────────────────────────────────────────

function SuccessScreen({ data, countdown }: { data: FormFields; countdown: Countdown }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    return () => cancelAnimationFrame(id)
  }, [])

  const opts     = getWeightOptions(data.genero, data.categoria)
  const wOpt     = opts?.find(o => o.key === data.categoria_peso)
  const pesoLabel = data.categoria === 'absoluto' ? 'Absoluto' : (wOpt ? `${wOpt.label} ${wOpt.range}` : '—')

  const pad = (n: number) => String(n).padStart(2, '0')
  const cdStr = countdown.passed
    ? '¡HOY ES EL DÍA!'
    : `${countdown.d}D ${pad(countdown.h)}H ${pad(countdown.m)}M ${pad(countdown.s)}S`

  const cap = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '—'

  return (
    <main style={{
      minHeight:      '100vh',
      background:     '#050810',
      color:          '#f0f4ff',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '48px 24px',
      opacity:        visible ? 1 : 0,
      transform:      visible ? 'translateY(0)' : 'translateY(28px)',
      transition:     'opacity 0.65s ease, transform 0.65s ease',
    }}>
      <div style={{ maxWidth: '640px', width: '100%' }}>

        {/* Checkmark */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', border: '2px solid #c9a227', borderRadius: '2px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>

        {/* Confirmed label */}
        <div style={{ textAlign: 'center', fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '8px', textTransform: 'uppercase', color: '#c9a227', marginBottom: '8px' }}>
          Inscripción Confirmada
        </div>

        {/* Athlete name */}
        <h1 style={{ textAlign: 'center', fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: 'clamp(2.8rem, 9vw, 5.5rem)', letterSpacing: '4px', lineHeight: 0.9, margin: '0 0 8px' }}>
          {data.nombre_completo.toUpperCase()}
        </h1>
        <div style={{ textAlign: 'center', fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.875rem', color: '#8a9ab5', letterSpacing: '2px', marginBottom: '28px' }}>
          {data.academia}
        </div>

        {/* Gold divider */}
        <div style={{ width: '80px', height: '2px', background: 'linear-gradient(90deg, transparent, #c9a227, transparent)', margin: '0 auto 32px' }} />

        {/* Competitor badge */}
        <div style={{
          background:    'rgba(7,20,40,0.8)',
          border:        '1px solid rgba(201,162,39,0.25)',
          borderRadius:  '2px',
          padding:       '28px 32px',
          marginBottom:  '28px',
          display:       'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap:           '24px',
        }}>
          {[
            { label: 'Faixa',     value: cap(data.faja)     },
            { label: 'División',  value: data.division === 'nogi' ? 'No-Gi' : cap(data.division) },
            { label: 'Categoría', value: cap(data.categoria) },
            { label: 'Peso',      value: pesoLabel           },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#c9a227', marginBottom: '6px' }}>
                {label}
              </div>
              <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '1rem', fontWeight: 600, color: '#f0f4ff', letterSpacing: '1px' }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Countdown to event */}
        <div style={{ textAlign: 'center', marginBottom: '28px', padding: '20px', border: '1px solid rgba(42,107,194,0.2)', borderRadius: '2px' }}>
          <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: '#8a9ab5', marginBottom: '8px' }}>
            Faltan
          </div>
          <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: 'clamp(1.8rem, 6vw, 2.8rem)', letterSpacing: '4px', color: '#e8c14a', lineHeight: 1 }}>
            {cdStr}
          </div>
          <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#8a9ab5', marginTop: '8px' }}>
            23 DE AGOSTO · MALDONADO, URUGUAY
          </div>
        </div>

        {/* Payment instructions */}
        <div style={{ background: 'rgba(201,162,39,0.05)', border: '1px solid rgba(201,162,39,0.2)', padding: '24px 28px', marginBottom: '32px', borderRadius: '2px' }}>
          <div style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: '#c9a227', marginBottom: '12px' }}>
            Confirmá tu lugar
          </div>
          <p style={{ fontFamily: 'var(--font-barlow), sans-serif', fontSize: '0.95rem', lineHeight: 1.8, color: '#d0d8e8', margin: 0 }}>
            Realizá la transferencia indicando tu nombre completo. Una vez confirmado el pago, tu inscripción queda activa. Ricardo te va a contactar con los detalles del pago por WhatsApp.
          </p>
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center' }}>
          <a href="/"
            style={{ display: 'inline-block', border: '1px solid rgba(42,107,194,0.3)', color: '#8a9ab5', fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', textDecoration: 'none', padding: '12px 28px', borderRadius: '2px' }}>
            ← Volver al inicio
          </a>
        </div>

      </div>
    </main>
  )
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

const STEP_LABELS = ['Datos', 'Academia', 'Categoría', 'Pago']

function ProgressBar({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', gap: '0' }}>
      {STEP_LABELS.map((label, i) => {
        const s       = i + 1
        const done    = s < step
        const current = s === step
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 && (
              <div style={{ width: '48px', height: '1px', background: done ? '#c9a227' : 'rgba(42,107,194,0.25)', transition: 'background 0.3s' }} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width:      '32px',
                height:     '32px',
                borderRadius: '2px',
                border:     `2px solid ${done || current ? '#c9a227' : 'rgba(42,107,194,0.3)'}`,
                background: done ? '#c9a227' : current ? 'rgba(201,162,39,0.1)' : 'transparent',
                display:    'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s',
                flexShrink: 0,
              }}>
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#050810" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <span style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: '0.9rem', color: current ? '#c9a227' : '#4a5a70', letterSpacing: '1px' }}>
                    {s}
                  </span>
                )}
              </div>
              <span style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: done || current ? '#c9a227' : '#4a5a70', transition: 'color 0.3s', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── StepHeader ───────────────────────────────────────────────────────────────

function StepHeader({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid rgba(201,162,39,0.12)' }}>
      <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: '3.5rem', color: 'rgba(201,162,39,0.15)', letterSpacing: '2px', lineHeight: 1, flexShrink: 0, marginTop: '-6px' }}>
        {number}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: '1.6rem', letterSpacing: '3px', color: '#f0f4ff', lineHeight: 1, marginBottom: '4px' }}>
          {title.toUpperCase()}
        </div>
        <div style={{ fontFamily: 'var(--font-barlow), sans-serif', fontSize: '0.82rem', color: '#8a9ab5' }}>
          {subtitle}
        </div>
      </div>
    </div>
  )
}

// ─── StepNav ─────────────────────────────────────────────────────────────────

function StepNav({ step, onNext, onPrev, submitting, isLastStep = false }: {
  step: number; onNext: () => void; onPrev: () => void; submitting: boolean; isLastStep?: boolean
}) {
  return (
    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
      {step > 1 && (
        <button type="button" onClick={onPrev}
          style={{ flex: '0 0 auto', background: 'transparent', border: '1px solid rgba(42,107,194,0.3)', color: '#8a9ab5', fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '14px 20px', borderRadius: '2px', cursor: 'pointer' }}>
          ← Volver
        </button>
      )}
      {isLastStep ? (
        <button type="submit" disabled={submitting}
          style={{ flex: 1, background: submitting ? 'rgba(201,162,39,0.5)' : '#c9a227', color: '#050810', fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '1rem', fontWeight: 900, letterSpacing: '4px', textTransform: 'uppercase', border: 'none', padding: '16px', borderRadius: '2px', cursor: submitting ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
          {submitting ? 'ENVIANDO...' : 'CONFIRMAR INSCRIPCIÓN'}
        </button>
      ) : (
        <button type="button" onClick={onNext}
          style={{ flex: 1, background: '#c9a227', color: '#050810', fontFamily: 'var(--font-barlow-condensed), sans-serif', fontSize: '1rem', fontWeight: 900, letterSpacing: '4px', textTransform: 'uppercase', border: 'none', padding: '16px', borderRadius: '2px', cursor: 'pointer', transition: 'background 0.2s' }}>
          SIGUIENTE →
        </button>
      )}
    </div>
  )
}

// ─── StatPill + Divider ───────────────────────────────────────────────────────

function StatPill({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px', padding: '10px 24px' }}>
      {children}
    </div>
  )
}

function Divider() {
  return <div style={{ width: '1px', alignSelf: 'stretch', background: 'rgba(201,162,39,0.15)', margin: '8px 0' }} />
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={LABEL_STYLE}>{label}</label>
      {children}
      {error && <p style={ERROR_TEXT}>{error}</p>}
    </div>
  )
}
