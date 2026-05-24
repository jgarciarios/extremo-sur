# EXTREMO SUR BJJ — Contexto del Proyecto

## Quién soy
Juan Ignacio García Ríos. Estudiante avanzado de dos carreras en UADE:

- Licenciatura en Gestión IT (terminando julio 2026)
- Ingeniería en Informática (fin 2027)

Stack personal: Python (Pandas, BeautifulSoup), SQL, Power BI, ETL Pipelines, Web Scraping, Git, JavaScript, TypeScript.
Nivel: casi Ingeniero en Informática — no explicar conceptos básicos.
Objetivo profesional: conseguir primera posición corporativa como Junior Data Analyst / Data Engineer / BI Analyst.

## Por qué existe este proyecto
Doble propósito:

- Entregar una landing page profesional a Ricardo (dueño del torneo) antes del 30 de mayo 2026
- Usarlo como caso de portfolio real para conseguir trabajo en tecnología

## Qué es Extremo Sur BJJ
Torneo de Brazilian Jiu Jitsu organizado por Ricardo en Maldonado, Uruguay.
Varios años de historia. Referente regional del BJJ.

## Problema actual (todo manual)

- Inscripciones por Google Form
- Brackets hechos a mano por Ricardo
- Puntuaciones anotadas en papel por llamadores
- Llaves fotografiadas y subidas como imagen
- Puntos por academia calculados con calculadora

## Circuito 2026 — 3 fechas

| Fecha | Evento |
|---|---|
| 30 de Mayo | 1° Etapa — Circuito Extremo Sur |
| 23 de Agosto | AJP Uruguay (fecha internacional especial) |
| 31 de Octubre | 2° Etapa — Circuito Extremo Sur |

## Links importantes

- Instagram: https://www.instagram.com/extremosurbjj/
- Google Form inscripción: https://forms.gle/24XEP3X4EsKp1ftR7
- Fotos edición anterior: https://drive.google.com/drive/folders/1SVU5gwh9YCKDxCRFIjWpEMGMCojTQmDhF
- Categorías 1° etapa 2026: https://drive.google.com/file/d/1Dar7N5pRzIpuMYfRL1xHp_8uHe794LUJ/view

## Identidad visual

| Variable | Valor |
|---|---|
| Negro base | #050810 |
| Azul profundo | #071428 |
| Azul medio | #0d2144 |
| Azul acero | #2a6bc2 |
| Dorado principal | #c9a227 |
| Dorado claro | #e8c14a |
| Blanco | #f0f4ff |
| Gris | #8a9ab5 |

Tipografías (Google Fonts):

- Display: Bebas Neue
- Headings: Barlow Condensed
- Body: Barlow

Referencia estética: oscura, combativa, estilo UFC — no corporativo ni pastel.

## Estado actual de la V1

### Completado
- [x] Navbar fija con scroll suave
- [x] Hero animado con las 3 fechas del circuito
- [x] Sección Fechas (card AJP en dorado diferenciada)
- [x] Sección Historia con stats
- [x] Sección Categorías (Kids, Juvenil, Adulto, Master, Absoluto)
- [x] Galería con placeholders (esperando fotos reales)
- [x] Sección Inscripción conectada al Google Form
- [x] Footer con créditos
- [x] Responsive mobile

### Pendiente V1
- [ ] Reemplazar placeholders de galería con fotos reales del torneo
- [ ] Confirmar años exactos de historia del torneo con Ricardo
- [ ] Confirmar lugar exacto del evento (venue)
- [ ] Confirmar precio de inscripción
- [ ] Agregar logos de sponsors
- [ ] Deploy en Netlify o GitHub Pages
- [ ] Compartir URL con Ricardo antes del 30 de mayo

## Roadmap V2 (post 30 de mayo)
Sistema completo que reemplaza el flujo manual de Ricardo:

- Sistema de inscripción propio (reemplaza Google Form)
- Carrito de pagos (débito, crédito, transferencia)
- Brackets automáticos generados desde los inscriptos
- Roles de usuario: Admin / Llamador / Público
- Live tracking del evento para padres y seguidores
- Puntuación automatizada por academia
- Panel de premiación automático
- Base de datos de competidores con analytics

Stack V2 por definir (candidatos: Supabase, Next.js, Vercel)

## Cómo trabajamos

- Juan codea en VS Code con Claude Code en la terminal
- Este proyecto en Cowork es para consultas, arquitectura y decisiones
- Ser directo, técnico, sin explicar lo obvio
- Si algo está mal, decirlo sin filtro
- Primero definir acá, después implementar en VS Code
- Cada feature nueva: primero arquitectura → después código
