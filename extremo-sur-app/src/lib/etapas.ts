// ─── Datos de cada etapa del circuito ────────────────────────────────────────
// Para agregar una etapa nueva: copiar un objeto y actualizar los campos.

export type EstadoEtapa = 'proximo' | 'en-curso' | 'finalizado'

export interface BloqueHorario {
  titulo: string
  color:  string
  items:  { hora: string; desc: string; highlight?: boolean }[]
}

export interface Podio {
  categoria: string
  division:  string
  primero:   string
  segundo:   string
  tercero?:  string
  academia1: string
  academia2: string
  academia3?: string
}

export interface Etapa {
  slug:        string
  numero:      string          // "1°" | "AJP" | "2°"
  titulo:      string
  subtitulo:   string
  fecha:       string          // "30 de Mayo 2026"
  fechaISO:    string          // "2026-05-30"
  venue:       string
  ciudad:      string
  estado:      EstadoEtapa
  esAJP:       boolean
  descripcion: string
  cronograma:  BloqueHorario[] | null
  reglamento:  {
    camiseta: string[]
    shorts:   string[]
    porFaja:  { faja: string; color: string; ejemplo: string }[]
  } | null
  fotos:       string[]        // paths en /public o URLs externas
  videos:      { titulo: string; url: string }[]
  podios:      Podio[]
}

// ─── Etapas 2026 ─────────────────────────────────────────────────────────────

export const ETAPAS: Etapa[] = [
  {
    slug:      'primera-etapa',
    numero:    '1°',
    titulo:    '1° Etapa',
    subtitulo: 'Circuito Extremo Sur',
    fecha:     '30 de Mayo 2026',
    fechaISO:  '2026-05-30',
    venue:     'Campus de Maldonado',
    ciudad:    'Maldonado, Uruguay',
    estado:    'finalizado',
    esAJP:     false,
    descripcion: 'Primera fecha del Circuito Extremo Sur 2026. Más de 400 competidores de toda la región se dieron cita en el Campus de Maldonado.',
    cronograma: [
      {
        titulo: 'APERTURA',
        color: '#c9a227',
        items: [
          { hora: '08:30', desc: 'Apertura de los portones' },
        ]
      },
      {
        titulo: 'NO-GI — MAÑANA',
        color: '#2a6bc2',
        items: [
          { hora: '09:00', desc: 'Pesaje — Avanzados (marrón y negro) adulto y master' },
          { hora: '09:30', desc: 'Inicio de luchas — Avanzados (marrón y negro) adulto y master' },
          { hora: '09:30', desc: 'Pesaje — Blancos masculino adulto y master' },
          { hora: '09:50', desc: 'Inicio de luchas — Blanco masculino adulto y master' },
          { hora: '10:30', desc: 'Pesaje — Infanto juvenil, juvenil y todas las categorías femenino' },
          { hora: '11:15', desc: 'Inicio de luchas — Infanto juvenil, juvenil y femenino' },
          { hora: '11:20', desc: 'Pesaje — Intermedio masculino (azul, violeta) adulto y master' },
          { hora: '11:45', desc: 'Inicio de luchas — Intermedio masculino (azul, violeta) adulto y master' },
        ]
      },
      {
        titulo: 'GI (KIMONO) — MEDIODÍA',
        color: '#2a6bc2',
        items: [
          { hora: '12:15', desc: 'Pesaje — Cinturón marrón y negro masculino' },
          { hora: '12:30', desc: 'Inicio de luchas — Marrón y negro masculino' },
          { hora: '12:40', desc: 'Pesaje — Blanco pluma, pena y leve adulto y master' },
          { hora: '13:00', desc: 'Inicio de luchas — Blanco pluma, pena y leve adulto y master' },
        ]
      },
      {
        titulo: 'KIDS',
        color: '#e8c14a',
        items: [
          { hora: '13:00', desc: 'Pesaje de los niños y organización (en colaboración con los profesores)' },
          { hora: '13:30', desc: 'Luchas de los niños (en colaboración con los profesores)' },
        ]
      },
      {
        titulo: 'GI (KIMONO) — TARDE',
        color: '#2a6bc2',
        items: [
          { hora: '14:10', desc: 'Pesaje — Blanco medio, medio pesado, pesado y pesadísimo adulto y master' },
          { hora: '14:30', desc: 'Inicio de luchas — Blanco medio, medio pesado, pesado y pesadísimo' },
          { hora: '15:15', desc: 'Pesaje — Infanto juvenil, juvenil y femenino (todas las categorías)' },
          { hora: '15:30', desc: 'Inicio de luchas — Femenino e infanto juvenil' },
          { hora: '15:45', desc: 'Pesaje — Cinturón azul adulto y master' },
          { hora: '16:50', desc: 'Inicio de luchas — Cinturón azul adulto y master' },
          { hora: '17:30', desc: 'Pesaje — Cinturón violeta adulto y master' },
          { hora: '17:50', desc: 'Inicio de luchas — Cinturón violeta adulto y master' },
        ]
      },
      {
        titulo: 'ABSOLUTOS',
        color: '#c9a227',
        items: [
          { hora: '16:00', desc: 'Cinturón blanco adulto y master — confirmar asistencia al absoluto', highlight: true },
          { hora: '16:00', desc: 'Categorías femenino, infanto juvenil y juvenil — confirmar asistencia al absoluto', highlight: true },
          { hora: '16:00', desc: 'Cinturones marrón y negro — confirmar asistencia', highlight: true },
          { hora: '17:30', desc: 'Cinturón azul adulto y master — confirmar asistencia al absoluto', highlight: true },
          { hora: '17:30', desc: 'Cinturón violeta — confirmar asistencia al absoluto', highlight: true },
          { hora: '18:20', desc: 'Inicio de todos los absolutos — blancos, azules, violetas, marrón y negro adulto y master' },
        ]
      },
    ],
    reglamento: {
      camiseta: [
        'Material elástico',
        'Largo que cubra todo el torso',
        'Color: negro, blanco, o negro y blanco con al menos 10% del color de graduación',
        'También se permiten camisetas 100% del color de graduación',
        'Cinturones negros: se acepta una pequeña área roja que no recaracterice el color',
      ],
      shorts: [
        'Tejido completamente negro',
        'Largo: entre la mitad del muslo y la rodilla (no más de 15cm por encima)',
        'Detalles y logotipos de cualquier color',
        'Se permiten calzas negras, blancas o negro y blanco por debajo',
      ],
      porFaja: [
        { faja: 'Blanca', color: '#f0f4ff', ejemplo: 'Camiseta blanca, negra o negro/blanca' },
        { faja: 'Azul',   color: '#3b82f6', ejemplo: 'Camiseta azul, negra o negro con 10% azul' },
        { faja: 'Morada', color: '#a855f7', ejemplo: 'Camiseta morada, negra o negro con 10% morado' },
        { faja: 'Marrón', color: '#b45309', ejemplo: 'Camiseta marrón, negra o negro con 10% marrón' },
        { faja: 'Negra',  color: '#9ca3af', ejemplo: 'Camiseta negra — se acepta pequeña área roja' },
      ],
    },
    fotos:  [],
    videos: [],
    podios: [],
  },

  {
    slug:      'ajp-uruguay',
    numero:    'AJP',
    titulo:    'AJP Uruguay',
    subtitulo: 'Evento Internacional',
    fecha:     '23 de Agosto 2026',
    fechaISO:  '2026-08-23',
    venue:     'Por confirmar',
    ciudad:    'Maldonado, Uruguay',
    estado:    'proximo',
    esAJP:     true,
    descripcion: 'El AJP Uruguay es un evento del circuito internacional Abu Dhabi Jiu-Jitsu Pro, organizado de forma independiente. Competidores de Extremo Sur participan en esta fecha como representantes de la región.',
    cronograma:  null,
    reglamento:  null,
    fotos:       [],
    videos:      [],
    podios:      [],
  },

  {
    slug:      'segunda-etapa',
    numero:    '2°',
    titulo:    '2° Etapa',
    subtitulo: 'Circuito Extremo Sur',
    fecha:     '31 de Octubre 2026',
    fechaISO:  '2026-10-31',
    venue:     'Por confirmar',
    ciudad:    'Maldonado, Uruguay',
    estado:    'proximo',
    esAJP:     false,
    descripcion: 'Segunda y última fecha del Circuito Extremo Sur 2026. Definición del medallero general por academias.',
    cronograma:  null,
    reglamento:  null,
    fotos:       [],
    videos:      [],
    podios:      [],
  },
]

export function getEtapa(slug: string) {
  return ETAPAS.find(e => e.slug === slug) ?? null
}
