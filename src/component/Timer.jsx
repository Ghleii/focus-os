import { useState } from 'react'
import { useTimer } from '../hooks/useTimer'
import { appendSession, loadSessions } from '../lib/sessionStorage'

const initialSeconds = 1500

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function Timer() {
  const { remainingSeconds, isRunning, start, pause, stop } = useTimer(initialSeconds)
  const [sessions, setSessions] = useState(() => loadSessions())
  const isAtInitial = remainingSeconds === initialSeconds
  const statusLabel = isRunning ? 'Running' : isAtInitial ? 'Ready' : 'Paused'

  const handleStop = () => {
    const actualSec = initialSeconds - remainingSeconds

    if (actualSec > 0) {
      const endedAt = new Date()
      const startedAt = new Date(endedAt.getTime() - actualSec * 1000)

      const next = appendSession({
        id: crypto.randomUUID(),
        taskId: 'task-1',
        plannedSec: initialSeconds,
        actualSec,
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
      })

      setSessions(next)
    }

    stop()
  }

  const todayTotalSec = sessions
    .filter((session) => new Date(session.endedAt).toDateString() === new Date().toDateString())
    .reduce((sum, session) => sum + session.actualSec, 0)

  return (
    <section>
      <h2>Pomodoro Timer</h2>

      <p>{formatTime(remainingSeconds)}</p>

      <p>{statusLabel}</p>
      <p>Today: {Math.floor(todayTotalSec / 60)} min</p>

      <div>
        <button onClick={start} disabled={isRunning || remainingSeconds === 0}>
          Start
        </button>
        <button onClick={pause} disabled={!isRunning}>
          Pause
        </button>
        <button onClick={handleStop} disabled={isAtInitial}>
          Stop
        </button>
      </div>
    </section>
  )
}
