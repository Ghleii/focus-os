import { useTimer } from '../hooks/useTimer'

const initialSeconds = 1500

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function Timer() {
  const { remainingSeconds, isRunning, start, pause, stop } = useTimer(initialSeconds)
  const isAtInitial = remainingSeconds === initialSeconds
  const statusLabel = isRunning ? 'Running' : isAtInitial ? 'Ready' : 'Paused'

  return (
    <section>
      <h2>Pomodoro Timer</h2>

      <p>{formatTime(remainingSeconds)}</p>

      <p>{statusLabel}</p>

      <div>
        <button onClick={start} disabled={isRunning || remainingSeconds === 0}>
          Start
        </button>
        <button onClick={pause} disabled={!isRunning}>
          Pause
        </button>
        <button onClick={stop} disabled={isAtInitial}>
          Stop
        </button>
      </div>
    </section>
  )
}
