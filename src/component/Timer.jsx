import { Suspense, lazy, useState } from 'react'
import { useTimer } from '../hooks/useTimer'
import { appendSession, loadSessions, removeSessionById } from '../lib/sessionStorage'
import SessionHistory from './SessionHistory'

const SessionAnalytics = lazy(() => import('./SessionAnalytics'))

const initialSeconds = 1500
const TASK_OPTIONS = [
  { id: 'task-1', label: 'Task 1' },
  { id: 'task-2', label: 'Task 2' },
  { id: 'task-3', label: 'Task 3' },
]

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function Timer() {
  const { remainingSeconds, isRunning, start, pause, stop } = useTimer(initialSeconds)
  const [sessions, setSessions] = useState(() => loadSessions())
  const [selectedTaskId, setSelectedTaskId] = useState(TASK_OPTIONS[0].id)
  const isAtInitial = remainingSeconds === initialSeconds
  const statusLabel = isRunning ? 'Running' : isAtInitial ? 'Ready' : 'Paused'
  const selectedTaskLabel = TASK_OPTIONS.find((task) => task.id === selectedTaskId)?.label

  const handleStop = () => {
    const actualSec = initialSeconds - remainingSeconds

    try {
      if (actualSec > 0) {
        const endedAt = new Date()
        const startedAt = new Date(endedAt.getTime() - actualSec * 1000)

        const next = appendSession({
          id: crypto.randomUUID(),
          taskId: selectedTaskId,
          plannedSec: initialSeconds,
          actualSec,
          startedAt: startedAt.toISOString(),
          endedAt: endedAt.toISOString(),
        })

        setSessions(next)
      }
    } finally {
      stop()
    }
  }

  const todayTotalSec = sessions
    .filter((session) => new Date(session.endedAt).toDateString() === new Date().toDateString())
    .reduce((sum, session) => sum + session.actualSec, 0)

  const handleDeleteSession = (sessionId) => {
    const targetSession = sessions.find((session) => session.id === sessionId)
    const targetTaskLabel = TASK_OPTIONS.find((task) => task.id === targetSession?.taskId)?.label
    const shouldDelete = window.confirm(
      `${targetTaskLabel ? `${targetTaskLabel} のセッション` : 'このセッション'}を削除しますか？`,
    )
    if (!shouldDelete) {
      return
    }

    const next = removeSessionById(sessionId)
    setSessions(next)
  }

  return (
    <section>
      <h2>Pomodoro Timer</h2>

      <div>
        {TASK_OPTIONS.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => setSelectedTaskId(task.id)}
            disabled={isRunning || !isAtInitial}
            aria-pressed={selectedTaskId === task.id}
          >
            {selectedTaskId === task.id ? `● ${task.label}` : task.label}
          </button>
        ))}
      </div>

      <p>Current task: {selectedTaskLabel}</p>

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

      <Suspense fallback={<p>Loading analytics...</p>}>
        <SessionAnalytics sessions={sessions} taskOptions={TASK_OPTIONS} />
      </Suspense>

      <SessionHistory
        sessions={sessions}
        taskOptions={TASK_OPTIONS}
        onDeleteSession={handleDeleteSession}
      />
    </section>
  )
}
