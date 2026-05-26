// ─── Enums ───────────────────────────────────────────────────────────────────

export type FajaTipo = 'blanca' | 'azul' | 'morada' | 'marron' | 'negra'

export type DivisionTipo = 'gi' | 'nogi' | 'ambas'

export type CategoriaTipo = 'kids' | 'juvenil' | 'adulto' | 'master' | 'absoluto'

export type InscripcionEstado = 'pendiente' | 'confirmado' | 'presente' | 'retirado'

export type UserRol = 'admin' | 'llamador' | 'competidor'

// ─── Domain interfaces ───────────────────────────────────────────────────────

export interface Evento {
  id: string
  nombre: string
  fecha: string             // ISO date YYYY-MM-DD
  venue: string
  ciudad: string
  pais: string
  precio_usd: number
  division: DivisionTipo
  es_ajp: boolean
  formulario_url: string | null
  activo: boolean
  created_at: string
}

export interface Inscripcion {
  id: string
  evento_id: string
  documento: string
  competidor_nombre: string
  competidor_apellido: string
  competidor_email: string
  competidor_telefono: string | null
  academia: string
  ciudad: string
  pais: string
  categoria: CategoriaTipo
  division: DivisionTipo
  faja: FajaTipo | null
  peso_kg: number
  estado: InscripcionEstado
  pagado: boolean
  numero_bracket: number | null
  created_at: string
  updated_at: string
  // join
  evento?: Evento
}

export interface UserProfile {
  id: string             // matches auth.users.id
  email: string
  nombre: string | null
  rol: UserRol
  created_at: string
}
