// ─── Extremo Sur BJJ — Generación de brackets ────────────────────────────────
// Eliminación simple con byes automáticos.
// Entrada: array de IDs de inscriptos confirmados.
// Salida: array de peleas listas para insertar en la DB.

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface PeleaGenerada {
  ronda:            number        // 1 = primera ronda, numRondas = final
  orden:            number        // posición dentro de la ronda (0-indexed)
  competidor_1_id:  string | null // null si bye
  competidor_2_id:  string | null // null si bye
  es_bye:           boolean
  ganador_id:       string | null // pre-llenado si es bye
}

export interface CategoriaGenerada {
  division:        string
  faja:            string
  categoria:       string
  genero:          string
  categoria_peso:  string
  competidores:    { id: string; nombre: string; academia: string }[]
  peleas:          PeleaGenerada[]
  num_rondas:      number
}

export interface InscriptoParaBracket {
  id:        string
  nombre:    string
  academia:  string
  faja:      string
  division:  string
  categoria: string
  genero:    string
  peso_kg:   number
}

// ─── Clasificación por peso ───────────────────────────────────────────────────
// Basado en categorías estándar de BJJ (IBJJF / AJP aprox.)

const PESOS_ADULTO_M = [
  { nombre: 'galo',         max: 58.5  },
  { nombre: 'pluma',        max: 64.0  },
  { nombre: 'pena',         max: 69.0  },
  { nombre: 'leve',         max: 74.0  },
  { nombre: 'medio',        max: 79.0  },
  { nombre: 'meiopesado',   max: 85.0  },
  { nombre: 'pesado',       max: 91.0  },
  { nombre: 'superpesado',  max: 97.0  },
  { nombre: 'pesadissimo',  max: Infinity },
]

const PESOS_ADULTO_F = [
  { nombre: 'galo',         max: 48.5  },
  { nombre: 'pluma',        max: 53.5  },
  { nombre: 'pena',         max: 58.5  },
  { nombre: 'leve',         max: 63.5  },
  { nombre: 'medio',        max: 69.0  },
  { nombre: 'meiopesado',   max: 74.0  },
  { nombre: 'pesado',       max: Infinity },
]

// Kids y juvenil: buckets de 5 kg (no hay categorías estándar únicas)
function pesoKidsBucket(kg: number): string {
  return `${Math.floor(kg / 5) * 5}-${Math.floor(kg / 5) * 5 + 4}kg`
}

export function getPesoCategoria(pesoKg: number, genero: string, categoria: string): string {
  if (categoria === 'kids' || categoria === 'juvenil') {
    return pesoKidsBucket(pesoKg)
  }
  const tabla = genero === 'femenino' ? PESOS_ADULTO_F : PESOS_ADULTO_M
  return tabla.find(p => pesoKg <= p.max)?.nombre ?? 'pesadissimo'
}

// ─── Algoritmo de bracket ─────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function nextPow2(n: number): number {
  if (n <= 2) return 2
  return Math.pow(2, Math.ceil(Math.log2(n)))
}

/**
 * Genera las peleas para N competidores.
 * - Rellena con byes hasta la próxima potencia de 2.
 * - Los byes se distribuyen al final del bracket (posiciones más altas).
 * - Los ganadores de byes avanzan automáticamente (ganador_id pre-llenado).
 * - Las rondas siguientes a la primera son placeholders vacíos.
 */
export function generarPeleas(competidorIds: string[]): { peleas: PeleaGenerada[]; numRondas: number } {
  const n = competidorIds.length
  if (n < 2) return { peleas: [], numRondas: 0 }

  const shuffled     = shuffle(competidorIds)
  const bracketSize  = nextPow2(n)
  const numRondas    = Math.log2(bracketSize)

  // Slots: competidores primero, byes al final
  const slots: (string | null)[] = [
    ...shuffled,
    ...Array(bracketSize - n).fill(null),
  ]

  const peleas: PeleaGenerada[] = []

  // Ronda 1: emparejar de a dos
  for (let i = 0; i < bracketSize; i += 2) {
    const c1    = slots[i]
    const c2    = slots[i + 1]
    const esBye = c1 === null || c2 === null
    peleas.push({
      ronda:           1,
      orden:           i / 2,
      competidor_1_id: c1,
      competidor_2_id: c2,
      es_bye:          esBye,
      ganador_id:      esBye ? (c1 ?? c2) : null,
    })
  }

  // Rondas siguientes: placeholders vacíos (se completan cuando el llamador carga resultados)
  for (let ronda = 2; ronda <= numRondas; ronda++) {
    const numPeleas = bracketSize / Math.pow(2, ronda)
    for (let orden = 0; orden < numPeleas; orden++) {
      peleas.push({
        ronda,
        orden,
        competidor_1_id: null,
        competidor_2_id: null,
        es_bye:          false,
        ganador_id:      null,
      })
    }
  }

  return { peleas, numRondas }
}

// ─── Agrupación de inscriptos en categorías ───────────────────────────────────

/**
 * Agrupa los inscriptos confirmados en categorías de bracket.
 * Cada combinación única de (division, faja, categoria, genero, categoria_peso)
 * genera una llave independiente.
 */
export function agruparEnCategorias(inscriptos: InscriptoParaBracket[]): CategoriaGenerada[] {
  type GrupoKey = string
  const grupos = new Map<GrupoKey, {
    meta:         Omit<CategoriaGenerada, 'competidores' | 'peleas' | 'num_rondas'>
    competidores: { id: string; nombre: string; academia: string }[]
  }>()

  for (const ins of inscriptos) {
    const catPeso = getPesoCategoria(ins.peso_kg, ins.genero, ins.categoria)
    const key: GrupoKey = [ins.division, ins.faja, ins.categoria, ins.genero, catPeso].join('|')

    if (!grupos.has(key)) {
      grupos.set(key, {
        meta: {
          division:       ins.division,
          faja:           ins.faja,
          categoria:      ins.categoria,
          genero:         ins.genero,
          categoria_peso: catPeso,
        },
        competidores: [],
      })
    }

    grupos.get(key)!.competidores.push({
      id:       ins.id,
      nombre:   ins.nombre,
      academia: ins.academia,
    })
  }

  return Array.from(grupos.values()).map(({ meta, competidores }) => {
    if (competidores.length < 2) {
      // Categoría con un solo inscripto: campeón automático, sin peleas
      return { ...meta, competidores, peleas: [], num_rondas: 0 }
    }
    const { peleas, numRondas } = generarPeleas(competidores.map(c => c.id))
    return { ...meta, competidores, peleas, num_rondas: numRondas }
  })
}
