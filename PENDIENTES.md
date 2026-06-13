# Extremo Sur BJJ — Pendientes

> Generado: Junio 2026 | Incluye tareas de V1, SEO implementado y roadmap SEO

---

## ✅ Hecho en esta sesión (SEO técnico base)

- [x] `layout.tsx` — JSON-LD `@graph`: Organization + 2× SportsEvent + WebSite con SearchAction
- [x] `layout.tsx` — metadata completo: title template, description, keywords, OG, Twitter Card, robots, canonical
- [x] `inscripcion/layout.tsx` — metadata específico de alta intención + FAQPage JSON-LD (5 preguntas)
- [x] `fotos/layout.tsx` — metadata con keywords de galería
- [x] `inscriptos/page.tsx` — metadata + OG completo
- [x] `etapa/[slug]/page.tsx` — generateMetadata mejorado + SportsEvent JSON-LD por etapa con `offers` condicional
- [x] `sitemap.ts` — agregadas `/fotos` y `/resultados`, subida prioridad de `/inscripcion` a 0.95

---

## 🔴 Crítico — hacer antes del próximo deploy

### 1. Agregar H1 semántico al hero
**Archivo:** `src/app/(public)/page.tsx`

El hero usa `<div>` para "EXTREMO SUR". Sin `<h1>`, Google no identifica la keyword principal.

```tsx
// Reemplazar los dos divs con clase hero-title:
<h1 className="hero-title-group a2">
  <span className="hero-title">EXTREMO</span>
  <span className="hero-title blue">SUR</span>
</h1>
```

Ajustar CSS si el `<h1>` afecta estilos (probablemente no, es una clase CSS, no el tag).

---

### 2. Fix `<head>` manual en layout.tsx
**Archivo:** `src/app/layout.tsx` línea 192

El `<head>` explícito dentro del `<html>` en App Router puede causar warnings de hydration. Mover el script JSON-LD como primer elemento del `<body>`:

```tsx
<body className="...">
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
  />
  {children}
  <WhatsAppButton />
</body>
```

Y eliminar el bloque `<head>...</head>` del layout.

---

### 3. Verificar `/resultados`
**Archivo:** `src/app/resultados/page.tsx` (o lo que sea que renderice esa ruta)

Si la página está vacía o tiene thin content, agregar `noindex` hasta poblarla:

```tsx
export const metadata: Metadata = {
  robots: { index: false },
}
```

O directamente poblarla con los podios de la 1° etapa (ver tarea más abajo).

---

### 4. Deploy + verificación post-deploy

```bash
git add -A
git commit -m "feat: SEO foundation — JSON-LD, metadata completo, sitemap actualizado"
git push
```

Después verificar en:
- https://search.google.com/test/rich-results?url=https://extremo-sur.vercel.app/inscripcion → debe detectar FAQPage
- https://search.google.com/test/rich-results?url=https://extremo-sur.vercel.app → debe detectar SportsEvent
- https://extremo-sur.vercel.app/sitemap.xml → verificar que renderiza todas las URLs

---

### 5. Submit sitemap en Google Search Console

URL: https://search.google.com/search-console  
Sitemaps → Agregar: `https://extremo-sur.vercel.app/sitemap.xml`

Si aún no está el sitio verificado, el `google` verification ya está en `layout.tsx` — solo confirmar en GSC.

---

## 🟠 Alto — esta semana

### 6. Migrar imágenes a `next/image`

Actualmente **toda** la app usa `<img>` vanilla. El impacto en LCP (Core Web Vitals) es directo.

**Orden de prioridad:**

| Imagen | Archivo | Fix |
|---|---|---|
| Hero slideshow (LCP crítico) | `page.tsx` en el componente del slideshow | Restructurar de `backgroundImage` CSS a `<Image fill priority>` dentro de `position: relative` |
| Logo navbar | Donde esté el `<img>` del logo | `<Image priority width={} height={} alt="Extremo Sur BJJ" />` |
| Sponsors | Sección sponsors en homepage | `<Image width={} height={} alt="Logo [Sponsor] — Sponsor Extremo Sur BJJ" />` |
| Galería lightbox | `fotos/page.tsx` | `<Image>` con `sizes` apropiados |

El hero es el caso más difícil — requiere cambiar el markup del swiper para usar `<Image fill>` en lugar de CSS background. Si es muy invasivo, al menos poner `priority` en las primeras 2 imágenes y dejar el resto para V2.

---

### 7. Alt text descriptivo en galería

**Archivo:** `src/app/fotos/page.tsx`

Actualmente las imágenes tienen `alt` genérico (`"1° Etapa 2026"`). Cambiar a:

```tsx
// En vez de alt={foto.label}:
alt={`Competidores en ${foto.label} — Extremo Sur BJJ Maldonado, Uruguay`}
```

Variar entre imágenes si es posible. Google Images es tráfico gratis.

---

### 8. Crear página `/categorias`

**Nueva ruta:** `src/app/categorias/page.tsx`

Es el content gap más crítico. Los atletas buscan "categorías torneo jiu jitsu" antes de inscribirse y actualmente no hay URL indexable para eso — solo una sección de scroll en el homepage.

Contenido mínimo:
- H1: "Categorías del Torneo Extremo Sur BJJ 2026"
- Tabla de divisiones: Kids / Juvenil / Adulto / Master, con rangos de edad y peso por faja
- Gi vs No-Gi: diferencias y vestimenta requerida
- CTA → `/inscripcion`
- FAQPage JSON-LD: "¿Qué peso debo pesar?", "¿Puedo competir en Absoluto?"

Linkear desde:
- Nav (agregar "Categorías" como ítem)
- Homepage — sección de categorías → cambiar link de Google Drive PDF a `/categorias`
- Páginas de etapa

---

### 9. Datos reales de Ricardo (cierre V1)

Confirmar y actualizar con Ricardo:

- [ ] **Años de historia** — cantidad exacta para el stat animado ("X años de competencia real")
- [ ] **Venue exacto** — nombre completo del Campus de Maldonado (dirección, cómo llegar)
- [ ] **Precio de inscripción** — para mostrar en `/inscripcion` y en el `Offer.price` del JSON-LD
- [ ] **Sponsors** — logos en alta resolución + nombre de cada sponsor
- [ ] **Fotos reales** — reemplazar placeholders de la galería con fotos del torneo

---

## 🟡 Medio — este mes

### 10. Poblar `/resultados` con datos de 1° Etapa

Los nombres de atletas indexados generan tráfico de cola larga permanente. Cuando un competidor busca su nombre + BJJ en Google, este sitio puede aparecer.

Contenido mínimo:
- Podios por categoría (1°, 2°, 3° lugar)
- Nombre del atleta + academia + ciudad
- Tabla filtrable por categoría/faja/academia

Bonus: agregar metadata con `ItemList` JSON-LD de los ganadores.

---

### 11. Sección testimonios en homepage

Texto crawleable que el homepage actualmente no tiene suficiente. 3-4 quotes de atletas reales:

```html
<section class="testimonios">
  <blockquote>
    "El mejor torneo del Uruguay, organización impecable."
    <cite>— Nombre, Academia, Faja Azul</cite>
  </blockquote>
  ...
</section>
```

---

### 12. Listar en Google My Business + bjj-championships.com

- **Google My Business** → crear evento "Extremo Sur BJJ 2° Etapa 2026" con venue, fecha y link al sitio
- **bjj-championships.com** → tiene formulario para listar torneos. Genera backlink de alta autoridad + tráfico de atletas buscando torneos.
- **Instagram bio** → confirmar que el link apunta a `https://extremo-sur.vercel.app` (citación de backlink social)

---

### 13. Breadcrumbs en páginas de etapa

**Archivo:** `src/app/etapa/[slug]/page.tsx`

Agregar BreadcrumbList JSON-LD + nav visible:

```tsx
const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": BASE_URL },
    { "@type": "ListItem", "position": 2, "name": etapa.titulo, "item": `${BASE_URL}/etapa/${etapa.slug}` },
  ],
}
```

---

### 14. Conectar GitHub → Netlify (o Vercel) para auto-deploy

Pendiente de V1. Objetivo: git push → deploy automático en ~30s.

Si ya está en Vercel (la URL es `extremo-sur.vercel.app`), verificar si el auto-deploy desde el repo de GitHub ya está configurado. Si no, conectarlo desde el dashboard de Vercel:
Settings → Git → Connect GitHub Repository.

---

## 🔵 V2 — Largo plazo (post 31 Octubre 2026)

### SEO de largo plazo

- **`/atletas/[nombre]`** — Perfiles de atleta con historial de torneos. Cada perfil es una URL única indexable. Fuente masiva de tráfico orgánico de cola larga.
- **`/academias/[slug]`** — Directorio de academias. Genera backlinks naturales: cada academia linkea al sitio desde sus redes.
- **Blog** — Mínimo viable: recap post-torneo con fotos + stats + podios. 800 palabras + imágenes con alt text = tráfico que crece.
- **`/categorias` dinámicas desde Supabase** — Cuando cambien las categorías, se actualiza solo.
- **Rich Snippets de rankings** — Si se agrega un sistema de puntos por academia, usar `ItemList` JSON-LD para rankings.

### Sistema V2 (ya en roadmap)

- Sistema de inscripción propio (reemplaza Google Form)
- Carrito de pagos: débito, crédito, transferencia
- Brackets automáticos desde inscriptos
- Roles: Admin / Llamador / Público
- Live tracking del evento
- Puntuación automatizada por academia
- Panel de premiación automático
- Analytics de competidores

**Stack candidato:** Supabase (ya instalado) + Next.js (ya instalado) + Vercel (ya deployado). Definir antes de empezar: auth provider, estructura de tablas para brackets, modelo de permisos RLS.

---

## Resumen de prioridades

| # | Tarea | Impacto | Esfuerzo | Cuándo |
|---|---|---|---|---|
| 1 | H1 en hero | 🔴 Crítico | 30 min | Hoy |
| 2 | Fix `<head>` manual en layout | 🟡 Medio | 15 min | Hoy |
| 3 | Verificar/noindex `/resultados` | 🟠 Alto | 15 min | Hoy |
| 4 | Deploy + verificar Rich Results | 🔴 Crítico | 30 min | Hoy |
| 5 | Submit sitemap en GSC | 🔴 Crítico | 5 min | Hoy |
| 6 | Migrar imágenes a `next/image` | 🔴 Alto (LCP) | 4-8h | Esta semana |
| 7 | Alt text galería | 🟠 Alto | 30 min | Esta semana |
| 8 | Crear `/categorias` | 🔴 Alto (content gap) | 4h | Esta semana |
| 9 | Datos reales de Ricardo | 🟠 Alto | Depende de Ricardo | Esta semana |
| 10 | Poblar `/resultados` | 🟠 Alto | 4h + data | Este mes |
| 11 | Testimonios en homepage | 🟡 Medio | 2h | Este mes |
| 12 | Google My Business + listados | 🟠 Alto | 1h | Este mes |
| 13 | Breadcrumbs en etapas | 🟡 Medio | 1h | Este mes |
| 14 | Auto-deploy GitHub → Vercel | 🟠 Alto | 30 min | Esta semana |
