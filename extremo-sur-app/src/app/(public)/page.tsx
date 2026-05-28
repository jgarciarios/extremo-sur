'use client'

import { useEffect, useRef, useState, memo } from 'react'
import Script from 'next/script'
import './landing.css'

// ─── Fotos ────────────────────────────────────────────────────────────────────

const FOTOS = [
  '/assets/img/foto1.jpeg',
  '/assets/img/foto2.jpeg',
  '/assets/img/foto3.jpeg',
  '/assets/img/foto4.jpeg',
  '/assets/img/foto5.jpeg',
  '/assets/img/foto6.jpeg',
  '/assets/img/foto7.jpeg',
  '/assets/img/foto8.jpeg',
]

function pad(n: number) { return String(n).padStart(2, '0') }

// ─── Countdown — componente propio para no re-renderizar el resto de la página

const Countdown = memo(function Countdown() {
  const [cd, setCd] = useState({ days: '00', hours: '00', mins: '00', secs: '00', done: false })

  useEffect(() => {
    const TARGET = new Date('2026-05-30T03:00:00Z').getTime()
    const tick = () => {
      const diff = TARGET - Date.now()
      if (diff <= 0) { setCd(p => ({ ...p, done: true })); return }
      setCd({
        days:  pad(Math.floor(diff / 86400000)),
        hours: pad(Math.floor((diff % 86400000) / 3600000)),
        mins:  pad(Math.floor((diff % 3600000) / 60000)),
        secs:  pad(Math.floor((diff % 60000) / 1000)),
        done:  false,
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  if (cd.done) return <div className="cd-done a5">¡HOY ES EL DÍA!</div>

  return (
    <div className="countdown a5">
      <div className="cd-block"><span className="cd-num">{cd.days}</span><span className="cd-label">Días</span></div>
      <div className="cd-sep">:</div>
      <div className="cd-block"><span className="cd-num">{cd.hours}</span><span className="cd-label">Horas</span></div>
      <div className="cd-sep">:</div>
      <div className="cd-block"><span className="cd-num">{cd.mins}</span><span className="cd-label">Minutos</span></div>
      <div className="cd-sep">:</div>
      <div className="cd-block"><span className="cd-num">{cd.secs}</span><span className="cd-label">Segundos</span></div>
    </div>
  )
})

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [heroSlide, setHeroSlide] = useState(0)
  const [lb,        setLb]        = useState<{ open: boolean; idx: number }>({ open: false, idx: 0 })
  const swiperInited = useRef(false)

  // Nav scroll
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  // Hero slideshow
  useEffect(() => {
    const id = setInterval(() => setHeroSlide(s => (s + 1) % FOTOS.length), 3800)
    return () => clearInterval(id)
  }, [])

  // Lightbox keyboard
  useEffect(() => {
    if (!lb.open) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     setLb(l => ({ ...l, open: false }))
      if (e.key === 'ArrowLeft')  setLb(l => ({ ...l, idx: (l.idx - 1 + FOTOS.length) % FOTOS.length }))
      if (e.key === 'ArrowRight') setLb(l => ({ ...l, idx: (l.idx + 1) % FOTOS.length }))
    }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [lb.open])

  // Lightbox body overflow
  useEffect(() => {
    document.body.style.overflow = lb.open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lb.open])

  // Swiper init — se llama desde onLoad del Script
  function initSwiper() {
    if (swiperInited.current) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(window as any).Swiper) return
    swiperInited.current = true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (window as any).Swiper('.galeria-swiper', {
      loop: true, centeredSlides: true, spaceBetween: 4, slidesPerView: 1.2,
      autoplay: { delay: 3500, disableOnInteraction: false },
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { prevEl: '.swiper-btn-prev', nextEl: '.swiper-btn-next' },
      breakpoints: { 768: { slidesPerView: 2.5 }, 1024: { slidesPerView: 3.5 } },
    })
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      {/* Swiper CSS + JS desde CDN */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
      <Script
        src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"
        strategy="afterInteractive"
        onLoad={initSwiper}
      />

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className={scrolled ? 'scrolled' : ''}>
        <a href="/" className="nav-logo">
          <img src="/assets/img/logo.jpeg" alt="Extremo Sur BJJ" style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
        </a>
        <button
          className={`hamburger${menuOpen ? ' open' : ''}`}
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(m => !m)}
        >
          <span /><span /><span />
        </button>
        <ul className={`nav-links${menuOpen ? ' open' : ''}`}>
          <li><a href="#fechas"      onClick={closeMenu}>Fechas</a></li>
          <li><a href="#venue"       onClick={closeMenu}>Venue</a></li>
          <li><a href="#historia"    onClick={closeMenu}>Historia</a></li>
          <li><a href="#categorias"  onClick={closeMenu}>Categorías</a></li>
          <li><a href="#galeria"     onClick={closeMenu}>Galería</a></li>
          <li><a href="/inscriptos"  onClick={closeMenu}>Inscriptos</a></li>
          <li><a href="#inscripcion" className="nav-cta" onClick={closeMenu}>Inscribite</a></li>
        </ul>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="hero" id="inicio">
        <div className="hero-slideshow">
          {FOTOS.map((src, i) => (
            <div
              key={src}
              className={`hero-slide-bg${heroSlide === i ? ' active' : ''}`}
              style={{ backgroundImage: `url('${src}')` }}
            />
          ))}
        </div>
        <div className="hero-overlay" />
        <div className="hero-bg-pattern" />
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="hero-eyebrow a1">Brazilian Jiu Jitsu · Maldonado, Uruguay</div>
          <div className="hero-title a2">EXTREMO</div>
          <div className="hero-title blue a2">SUR</div>
          <div className="hero-subtitle a3">CIRCUITO 2026</div>
          <div className="hero-divider a3" />
          <div className="hero-badges a4">
            <span className="badge">30 MAYO — 1° ETAPA</span>
            <span className="badge">23 AGO — AJP URUGUAY</span>
            <span className="badge">31 OCT — 2° ETAPA</span>
          </div>
          <Countdown />
          <div className="a5">
            <a href="#inscripcion" className="btn-primary">INSCRIBITE AHORA</a>
            <a href="#historia"   className="btn-secondary">Conocé el torneo</a>
          </div>
        </div>
      </section>

      {/* ── FECHAS ──────────────────────────────────────────────────────── */}
      <section className="fechas line-accent" id="fechas">
        <div className="section-label">Calendario Oficial</div>
        <div className="section-title">FECHAS 2026</div>
        <div className="fechas-grid">
          <div className="fecha-card">
            <div className="fecha-num">30</div>
            <div className="fecha-mes">Mayo</div>
            <div className="fecha-etapa">1° Etapa · Circuito Extremo Sur</div>
          </div>
          <div className="fecha-card gold">
            <div className="ajp-tag">AJP URUGUAY</div>
            <div className="fecha-num">23</div>
            <div className="fecha-mes">Agosto</div>
            <div className="fecha-etapa">Evento Internacional Especial</div>
          </div>
          <div className="fecha-card">
            <div className="fecha-num">31</div>
            <div className="fecha-mes">Octubre</div>
            <div className="fecha-etapa">2° Etapa · Circuito Extremo Sur</div>
          </div>
        </div>
      </section>

      {/* ── VENUE ───────────────────────────────────────────────────────── */}
      <section className="venue line-accent" id="venue">
        <div className="section-label">El escenario</div>
        <div className="section-title">DÓNDE COMPETIMOS</div>
        <div className="venue-card">
          <div className="venue-pin">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
          </div>
          <div className="venue-name">Campus de Maldonado</div>
          <div className="venue-city">Maldonado, Uruguay</div>
          <a href="https://www.google.com/maps/search/Campus+de+Maldonado,+Uruguay" target="_blank" rel="noopener" className="btn-secondary">
            VER UBICACIÓN
          </a>
        </div>
      </section>

      {/* ── HISTORIA ────────────────────────────────────────────────────── */}
      <section className="historia" id="historia">
        <div className="historia-inner">
          <div className="historia-text">
            <div className="section-label">Nuestra historia</div>
            <h2>AÑOS DE <em>COMPETENCIA REAL</em></h2>
            <p>Extremo Sur BJJ nació en 2019 en Maldonado con una visión clara: llevar la competencia de Brazilian Jiu Jitsu al más alto nivel en el sur del continente.</p>
            <p>Año tras año, el torneo crece en participantes, academias y nivel técnico, consolidándose como uno de los eventos de referencia en la región.</p>
            <p>En 2026, el circuito incluye por primera vez una fecha oficial del AJP Uruguay, marcando un hito histórico para el BJJ regional.</p>
          </div>
          <div className="stats-grid">
            <div className="stat-box"><div className="stat-number">2019</div><div className="stat-label">Primera edición</div></div>
            <div className="stat-box"><div className="stat-number">3</div><div className="stat-label">Fechas en 2026</div></div>
            <div className="stat-box"><div className="stat-number">AJP</div><div className="stat-label">Fecha oficial Uruguay</div></div>
            <div className="stat-box"><div className="stat-number">+7</div><div className="stat-label">Años de historia</div></div>
          </div>
        </div>
      </section>

      {/* ── CATEGORÍAS ──────────────────────────────────────────────────── */}
      <section className="categorias line-accent" id="categorias">
        <div className="section-label">Competencia</div>
        <div className="section-title">CATEGORÍAS</div>
        <div className="categorias-grid">
          <div className="cat-card"><span className="cat-icon">I</span><div className="cat-name">Kids</div><div className="cat-desc">Categorías infantiles por edad y peso</div></div>
          <div className="cat-card"><span className="cat-icon">II</span><div className="cat-name">Juvenil</div><div className="cat-desc">División para competidores jóvenes</div></div>
          <div className="cat-card"><span className="cat-icon">III</span><div className="cat-name">Adulto</div><div className="cat-desc">Gi y No-Gi · Todas las fajas</div></div>
          <div className="cat-card"><span className="cat-icon">IV</span><div className="cat-name">Master</div><div className="cat-desc">Competidores +30 años</div></div>
          <div className="cat-card"><span className="cat-icon">V</span><div className="cat-name">Absoluto</div><div className="cat-desc">Sin límite de peso</div></div>
        </div>
        <div className="center">
          <a href="https://drive.google.com/file/d/1Dar7N5pRzIpuMYfRL1xHp_8uHe794LUJ/view" target="_blank" className="btn-secondary">
            VER LISTA COMPLETA DE CATEGORÍAS
          </a>
        </div>
      </section>

      {/* ── GALERÍA ─────────────────────────────────────────────────────── */}
      <section className="galeria" id="galeria">
        <div className="section-label">Momentos</div>
        <div className="section-title">GALERÍA</div>
        <div style={{ position: 'relative', marginBottom: 40 }}>
          <div className="swiper galeria-swiper">
            <div className="swiper-wrapper">
              {FOTOS.map((src, i) => (
                <div key={src} className="swiper-slide">
                  <div
                    className="galeria-slide"
                    style={{ backgroundImage: `url('${src}')` }}
                    onClick={() => setLb({ open: true, idx: i })}
                  >
                    <div className="g-overlay">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round">
                        <circle cx="10" cy="10" r="6"/><line x1="15" y1="15" x2="21" y2="21"/>
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="swiper-pagination" />
          </div>
          <button className="swiper-btn swiper-btn-prev" aria-label="Anterior">&#x2190;</button>
          <button className="swiper-btn swiper-btn-next" aria-label="Siguiente">&#x2192;</button>
        </div>
        <div className="center">
          <a href="https://drive.google.com/drive/folders/1SVU5gwh9YCKDxCRFIjWpEMGMCojTQmDhF" target="_blank" className="btn-secondary">
            VER TODAS LAS FOTOS
          </a>
        </div>
      </section>

      {/* ── INSCRIPCIÓN CTA ─────────────────────────────────────────────── */}
      <section className="inscripcion line-accent" id="inscripcion">
        <div className="inscripcion-content">
          <div className="section-label">Unite al circuito</div>
          <h2>INSCRIBITE<span>AHORA</span></h2>
          <div className="precio-badge">PRÓXIMA FECHA: 30 DE MAYO 2026</div>
          <p>Completá el formulario con tus datos, categoría y academia. Los cupos son limitados — no te quedés afuera.</p>
          {/* ⚠️  href="/inscripcion" — misma URL, sin target="_blank" */}
          <a href="/inscripcion" className="btn-primary">COMPLETAR INSCRIPCIÓN</a>
        </div>
      </section>

      {/* ── SPONSORS ────────────────────────────────────────────────────── */}
      <section className="sponsors" id="sponsors">
        <div className="section-label">Apoyan el circuito</div>
        <div className="section-title">NOS ACOMPAÑAN</div>
        <div className="sponsors-featured">
          <div className="sponsor-card-featured">
            <img className="sp-logo" src="/assets/sponsors/ega.png" alt="EGA" />
            <div className="sponsor-badge">CONVENIO ATLETAS</div>
            <div className="sp-name">EGA</div>
            <div className="sp-desc">Empresa de transporte. Descuento especial para competidores de Extremo Sur.</div>
            <a href="https://ega.com.uy/" target="_blank" rel="noopener" className="btn-secondary">VER MÁS</a>
          </div>
          <div className="sponsor-card-featured">
            <img className="sp-logo" src="/assets/sponsors/delbarcito.png" alt="Del Barcito Hostel" />
            <div className="sponsor-badge">CONVENIO ATLETAS</div>
            <div className="sp-name">Del Barcito Hostel</div>
            <div className="sp-desc">Hostel en Maldonado. Convenio de alojamiento para atletas que vienen de otras ciudades o países.</div>
          </div>
        </div>
        <div className="sponsors-simple">
          <div className="sponsor-card-simple">
            <img className="sp-logo" src="/assets/sponsors/sal-pimienta.png" alt="Sal e Pimienta" />
            <div className="sp-name">Sal e Pimienta</div>
          </div>
          <div className="sponsor-card-simple">
            <img className="sp-logo" src="/assets/sponsors/ubk.png" alt="UBK" />
            <div className="sp-name">UBK</div>
          </div>
          <div className="sponsor-card-simple">
            <img className="sp-logo" src="/assets/sponsors/bc-servicios.jpg" alt="BC Servicios" />
            <div className="sp-name">BC Servicios</div>
          </div>
          <div className="sponsor-card-simple">
            <img className="sp-logo" src="/assets/sponsors/mirador-fueguino.jpg" alt="El Mirador Fueguino" />
            <div className="sp-name">El Mirador Fueguino</div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer>
        <div className="footer-logo">EXTREMO SUR</div>
        <div className="footer-sub">Brazilian Jiu Jitsu · Maldonado, Uruguay</div>
        <ul className="footer-links">
          <li><a href="#fechas">Fechas</a></li>
          <li><a href="#venue">Venue</a></li>
          <li><a href="#historia">Historia</a></li>
          <li><a href="#categorias">Categorías</a></li>
          <li><a href="#galeria">Galería</a></li>
          <li><a href="#sponsors">Sponsors</a></li>
          <li><a href="https://www.instagram.com/extremosurbjj/" target="_blank">Instagram</a></li>
        </ul>
        <div className="footer-copy">
          © 2026 Extremo Sur BJJ · Desarrollado por <a href="#">Juan Ignacio García Ríos</a>
        </div>
      </footer>

      {/* ── LIGHTBOX ────────────────────────────────────────────────────── */}
      <div
        className={`lightbox${lb.open ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Galería de fotos"
        onClick={e => { if (e.target === e.currentTarget) setLb(l => ({ ...l, open: false })) }}
      >
        <button className="lb-btn lb-close" aria-label="Cerrar"
          onClick={() => setLb(l => ({ ...l, open: false }))}>
          &#x2715;
        </button>
        <button className="lb-btn lb-prev" aria-label="Anterior"
          onClick={e => { e.stopPropagation(); setLb(l => ({ ...l, idx: (l.idx - 1 + FOTOS.length) % FOTOS.length })) }}>
          &#x2190;
        </button>
        {lb.open && (
          <img className="lb-img" src={FOTOS[lb.idx]} alt="Foto del torneo" loading="lazy" />
        )}
        <button className="lb-btn lb-next" aria-label="Siguiente"
          onClick={e => { e.stopPropagation(); setLb(l => ({ ...l, idx: (l.idx + 1) % FOTOS.length })) }}>
          &#x2192;
        </button>
        <div className="lb-counter">{lb.idx + 1} / {FOTOS.length}</div>
      </div>
    </>
  )
}
