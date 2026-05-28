# Extremo Sur BJJ — Plataforma Web

Landing page y sistema de inscripciones para el Circuito Extremo Sur BJJ 2026, torneo referente de Brazilian Jiu Jitsu en Maldonado, Uruguay.

**Live:** [extremo-sur.vercel.app](https://extremo-sur.vercel.app)

---

## El problema

Ricardo organizaba el torneo con un stack 100% manual:

- Inscripciones por Google Form sin validación
- Sin control de pagos
- Brackets hechos a mano
- Puntuaciones en papel

Para el circuito 2026 (3 fechas, participantes de Uruguay, Argentina y Brasil) necesitaba una solución profesional antes del 30 de mayo.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS v4 + inline styles |
| Base de datos | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime (postgres_changes) |
| Deploy | Vercel |
| Fuentes | Google Fonts — Bebas Neue, Barlow Condensed, Barlow |

---

## Arquitectura

```
src/
├── app/
│   ├── (public)/           # Route group — landing pública
│   │   ├── page.tsx        # Landing page principal
│   │   └── landing.css     # Estilos del sitio público
│   ├── inscripcion/
│   │   └── page.tsx        # Formulario multi-step (3 pasos)
│   ├── admin/
│   │   ├── page.tsx        # Panel admin (server component — auth check)
│   │   └── login/
│   │       └── page.tsx    # Login con Supabase Auth
│   └── api/
│       └── inscripcion/
│           └── route.ts    # API Route — valida, sanitiza e inserta
├── components/
│   ├── InscriptosTable.tsx # Tabla admin con realtime, filtros y CSV export
│   └── WhatsAppButton.tsx  # Botón flotante (client component)
└── lib/
    ├── supabase/
    │   ├── client.ts       # Browser client
    │   └── server.ts       # Server client (SSR)
    └── types.ts            # Tipos compartidos
```

---

## Features V1

### Landing pública
- Hero con slideshow automático de fotos del torneo
- Countdown en tiempo real hacia la 1° fecha (30 mayo)
- Sección de fechas con card diferenciada para la fecha AJP (internacional)
- Sección historia con stats animados
- Galería con Swiper + lightbox
- Diseño mobile-first, responsive

### Formulario de inscripción
- Multi-step (3 pasos) con barra de progreso animada
- Autocomplete de ciudades — detecta mientras escribís, cubre Uruguay, Argentina, Brasil y más
- Lógica de divisiones y categorías de peso dinámica según género y categoría
- Validación client-side y server-side
- Rate limiting (5 req / 10 min por IP) via API Route
- Honeypot anti-spam
- Pantalla de confirmación post-inscripción con resumen del competidor

### Panel administrativo
- Protegido con Supabase Auth (solo admins)
- Actualización en tiempo real — nuevas inscripciones aparecen sin recargar
- Filtros por nombre, academia, email, faja y estado de pago
- Toggle de pagado/pendiente con optimistic update
- Export a CSV con todos los campos

---

## Base de datos

```sql
create table inscripciones (
  id             uuid primary key default gen_random_uuid(),
  nombre         text not null,
  documento      text not null,
  email          text not null,
  telefono       text,
  academia       text not null,
  ciudad         text not null,
  faja           text,
  genero         text,
  division       text not null,
  categoria      text not null,
  categoria_peso text,
  peso_kg        numeric not null,
  estado         text not null default 'pendiente',
  pagado         boolean not null default false,
  created_at     timestamptz not null default now()
);
```

Row Level Security habilitado. El panel admin accede vía service role key solo desde Server Components.

---

## Decisiones técnicas relevantes

**¿Por qué no un framework de UI?**
Stack vanilla para V1 — cero overhead, deploy instantáneo, sin lock-in. Cuando V2 necesite componentes complejos (brackets, live tracking), se evalúa.

**`React.memo` en el Countdown**
El countdown hace `setState` cada segundo. Sin memo, re-renderiza toda la landing rompiendo Swiper y scroll reveal. Componente aislado con su propio estado.

**Swiper via CDN + `next/script`**
Evita bundle de Swiper en el cliente. `strategy="afterInteractive"` + ref `swiperInited` para evitar doble inicialización en re-renders.

**Server Component + Client Component split**
`layout.tsx` es Server Component — no puede tener event handlers. `WhatsAppButton` es un Client Component separado con `'use client'`.

**API Route para inscripciones**
El form no escribe directo a Supabase desde el cliente. Pasa por `/api/inscripcion` que valida, sanitiza (XSS), aplica rate limiting y usa la service role key del servidor.

---

## Roadmap V2

Sistema completo que reemplaza el flujo manual de Ricardo:

- Sistema de inscripción propio con carrito de pagos (débito, crédito, transferencia)
- Brackets automáticos generados desde los inscriptos
- Roles: Admin / Llamador / Público
- Live tracking del evento para padres y seguidores
- Puntuación automatizada por academia
- Panel de premiación automático

---

## Setup local

```bash
git clone https://github.com/jgarciarios/extremo-sur
cd extremo-sur/extremo-sur-app
npm install
```

Crear `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

```bash
npm run dev
```

---

*Desarrollado por [Juan Ignacio García Ríos](https://github.com/jgarciarios)*
