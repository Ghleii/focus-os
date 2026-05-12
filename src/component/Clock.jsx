import { useState, useEffect } from 'react'

export default function Clock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const hm = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  const sec = String(now.getSeconds()).padStart(2, '0')
  const date = now.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        padding: '2rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 6vw',
          borderRadius: '40px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.2), 0 0 40px rgba(180, 230, 255, 0.1), inset 0 0 0 2px rgba(255, 255, 255, 0.4)',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          width: '100%',
          maxWidth: '1200px',
          color: '#F0F8FF', // AliceBlue (ほんのり青みがかった白)
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: '0.8rem',
            lineHeight: 1,
          }}
        >
          <span
            style={{
              fontFamily: "'Zen Maru Gothic', sans-serif",
              fontSize: 'clamp(80px, 20vw, 240px)',
              fontWeight: 900,
              letterSpacing: '0.02em',
              fontVariantNumeric: 'tabular-nums',
              textShadow: '0 8px 32px rgba(10, 40, 80, 0.4)',
            }}
          >
            {hm}
          </span>
          <span
            style={{
              fontFamily: "'Zen Maru Gothic', sans-serif",
              fontSize: 'clamp(28px, 6vw, 72px)',
              fontWeight: 700,
              opacity: 0.9,
              letterSpacing: '0.05em',
              fontVariantNumeric: 'tabular-nums',
              textShadow: '0 4px 16px rgba(10, 40, 80, 0.3)',
              alignSelf: 'flex-end',
              paddingBottom: '0.8em',
            }}
          >
            {sec}
          </span>
        </div>
        <div
          style={{
            marginTop: '1.5rem',
            fontFamily: "'Zen Maru Gothic', sans-serif",
            fontSize: 'clamp(16px, 3vw, 32px)',
            opacity: 0.9,
            letterSpacing: '0.15em',
            fontWeight: 700,
            color: '#D4F1F4', // Light Cyan Blue
            textShadow: '0 2px 12px rgba(10, 40, 80, 0.3)',
          }}
        >
          {date}
        </div>
      </div>
    </div>
  )
}
