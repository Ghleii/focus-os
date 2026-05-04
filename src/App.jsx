import Timer from './component/Timer'

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
          padding: '2rem 1rem'
        }}
      >
        <Timer />
      </div>
    </>
  )
}

export default App
