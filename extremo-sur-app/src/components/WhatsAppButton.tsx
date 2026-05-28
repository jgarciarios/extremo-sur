'use client'

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/59895246268?text=Hola%20Ricardo%2C%20tengo%20una%20consulta%20sobre%20Extremo%20Sur%20BJJ"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      style={{
        position:       'fixed',
        bottom:         '28px',
        right:          '28px',
        zIndex:         999,
        width:          '56px',
        height:         '56px',
        borderRadius:   '50%',
        background:     '#25d366',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        boxShadow:      '0 4px 20px rgba(37,211,102,0.45)',
        transition:     'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform  = 'scale(1.1)'
        e.currentTarget.style.boxShadow  = '0 6px 28px rgba(37,211,102,0.65)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform  = 'scale(1)'
        e.currentTarget.style.boxShadow  = '0 4px 20px rgba(37,211,102,0.45)'
      }}
    >
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M16 2C8.268 2 2 8.268 2 16c0 2.42.638 4.694 1.756 6.666L2 30l7.558-1.724A13.93 13.93 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm-3.98 7.5c-.24-.54-.493-.55-.722-.56-.187-.008-.4-.008-.614-.008-.214 0-.562.08-.856.4-.294.32-1.122 1.096-1.122 2.672s1.148 3.1 1.308 3.314c.16.214 2.222 3.546 5.47 4.834 2.706 1.068 3.254.856 3.84.802.587-.054 1.895-.774 2.162-1.522.267-.748.267-1.388.187-1.522-.08-.134-.294-.214-.614-.374-.32-.16-1.895-.936-2.189-1.042-.294-.107-.508-.16-.722.16-.214.32-.828 1.042-.988 1.256-.16.214-.32.24-.614.08-.294-.16-1.242-.458-2.368-1.462-.875-.78-1.467-1.744-1.64-2.038-.172-.294-.018-.453.129-.6.132-.13.294-.34.44-.508.147-.168.196-.294.294-.508.098-.214.049-.4-.026-.56-.075-.16-.698-1.748-.98-2.422z" fill="white"/>
      </svg>
    </a>
  )
}
