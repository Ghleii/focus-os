import { useState } from 'react'
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Clock as ClockIcon, Timer as TimerIcon, Settings, Menu } from 'lucide-react'
import Timer from './component/Timer'
import Clock from './component/Clock'

const navLinkStyle = {
  color: 'white',
  opacity: 0.6,
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.625rem 1rem',
  minHeight: '44px',
  borderRadius: '9999px',
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(8px)',
  transition: 'all 0.2s ease',
}

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  return (
    <>
      <div
        className="app-background"
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          width: '100vw', height: '100vh',
          zIndex: -1,
          pointerEvents: 'none',
          backgroundColor: '#2b5876',
          backgroundImage: `url("${import.meta.env.BASE_URL}background.jpg"), linear-gradient(135deg, #2b5876 0%, #4e4376 100%)`,
          backgroundSize: 'cover, auto',
          backgroundPosition: 'center, center',
          backgroundRepeat: 'no-repeat, no-repeat',
        }}
      />
      <Router>
        <Routes>
          <Route path="/" element={
            <div
              className="app-content"
              style={{
                position: 'relative', zIndex: 1,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center',
                minHeight: '100vh', width: '100%',
              }}
            >
              {/* Header — full width so buttons stay at viewport edges on any screen size */}
              <div style={{
                width: '100%',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem 1.5rem', flexShrink: 0,
              }}>
                <Link to="/clock" style={navLinkStyle}>
                  <ClockIcon size={20} />
                  <span style={{ fontWeight: 500 }}>Clock</span>
                </Link>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="glass-panel"
                    onClick={() => setIsSettingsOpen(true)}
                    style={{ padding: '0.75rem', borderRadius: '50%', border: 'none' }}
                    title="Settings"
                  >
                    <Settings size={24} />
                  </button>
                  <button
                    className="glass-panel"
                    onClick={() => setIsHistoryOpen(true)}
                    style={{ padding: '0.75rem', borderRadius: '50%', border: 'none' }}
                    title="History & Analytics"
                  >
                    <Menu size={24} />
                  </button>
                </div>
              </div>
              {/* Timer content */}
              <div style={{
                flex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '100%', padding: '0 1rem 2rem',
              }}>
                <Timer
                  isSettingsOpen={isSettingsOpen}
                  setIsSettingsOpen={setIsSettingsOpen}
                  isHistoryOpen={isHistoryOpen}
                  setIsHistoryOpen={setIsHistoryOpen}
                />
              </div>
            </div>
          } />
          <Route path="/clock" element={
            <div
              style={{
                position: 'relative', zIndex: 1,
                width: '100%', height: '100vh',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Link
                to="/"
                style={{ ...navLinkStyle, position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 10 }}
              >
                <TimerIcon size={20} />
                <span style={{ fontWeight: 500 }}>Timer</span>
              </Link>
              <Clock />
            </div>
          } />
        </Routes>
      </Router>
    </>
  )
}

export default App
