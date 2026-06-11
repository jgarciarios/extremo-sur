export const dynamic = 'force-dynamic'

export default function LlavesPage() {
  return (
    <>
      <div className="adm-topbar">
        <span className="adm-topbar-title">Llaves</span>
        <span className="adm-topbar-sep">·</span>
        <span className="adm-topbar-sub">Armado de brackets</span>
      </div>
      <div className="adm-main">
        <div className="adm-card">
          <div className="adm-card-body" style={{ textAlign: 'center', padding: '80px 40px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏆</div>
            <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '1.2rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#fff', marginBottom: 12 }}>
              Brackets — Próximamente
            </div>
            <div style={{ color: 'var(--adm-muted)', fontSize: '0.85rem', maxWidth: 400, margin: '0 auto' }}>
              Esta sección permitirá armar las llaves automáticamente por categoría y peso una vez cerradas las inscripciones.
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
