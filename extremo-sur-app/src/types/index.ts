export type FajaGi = 'blanca' | 'azul' | 'morada' | 'marron' | 'negra'
export type FajaNoGi = 'principiante' | 'intermedio' | 'avanzado' | 'elite'
export type Modalidad = 'gi' | 'nogi' | 'ambas'
export type Categoria = 'kids' | 'juvenil' | 'adulto' | 'master' | 'absoluto'
export type EstadoInscripcion = 'pendiente' | 'confirmada' | 'cancelada'
export type EstadoEvento = 'proximo' | 'en_curso' | 'finalizado'

export interface Evento {
  id: string
  nombre: string
  fecha: string          // ISO date
  venue: string
  ciudad: string
  pais: string
  precio_usd: number
  modalidad: Modalidad
  estado: EstadoEvento
  es_ajp: boolean
  formulario_url: string | null
  created_at: string
}

export interface Competidor {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono: string | null
  fecha_nacimiento: string   // ISO date
  peso_kg: number
  academia: string
  ciudad: string
  pais: string
  faja_gi: FajaGi | null
  faja_nogi: FajaNoGi | null
  created_at: string
}

export interface Inscripcion {
  id: string
  evento_id: string
  competidor_id: string
  categoria: Categoria
  modalidad: Modalidad
  faja_gi: FajaGi | null
  faja_nogi: FajaNoGi | null
  peso_kg: number
  estado: EstadoInscripcion
  monto_usd: number
  pagado: boolean
  numero_bracket: number | null
  created_at: string
  updated_at: string
  // joins
  evento?: Evento
  competidor?: Competidor
}
