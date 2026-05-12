import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Clock as ClockIcon, Timer as TimerIcon } from 'lucide-react'
import Timer from './component/Timer'
import Clock from './component/Clock'

function App() {
  return (
    <>
      <div
        className="app-background"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          pointerEvents: 'none', // Prevents background from blocking clicks
          backgroundColor: '#2b5876', // Base fallback color
          backgroundImage: `url("${import.meta.env.BASE_URL}background.jpg"), linear-gradient(135deg, #2b5876 0%, #4e4376 100%)`,
          backgroundSize: 'cover, auto',
          backgroundPosition: 'center, center',
          backgroundRepeat: 'no-repeat, no-repeat',
        }}
      />
      <Router basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={
            <div
              className="app-content"
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                width: '100%',
                padding: '2rem 1rem',
                gap: '1.5rem'
              }}
            >
              <Link
                to="/clock"
                style={{
                  position: 'absolute',
                  top: '1.5rem',
                  left: '1.5rem',
                  color: 'white',
                  opacity: 0.6,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s ease'
                }}
                className="hover:opacity-100 hover:bg-white/20"
              >
                <ClockIcon size={20} />
                <span style={{ fontWeight: 500 }}>Clock</span>
              </Link>
              <Timer />
            </div>
          } />
          <Route path="/clock" element={
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Link
                to="/"
                style={{
                  position: 'absolute',
                  top: '1.5rem',
                  left: '1.5rem',
                  color: 'white',
                  opacity: 0.6,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s ease',
                  zIndex: 10
                }}
                className="hover:opacity-100 hover:bg-white/20"
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
