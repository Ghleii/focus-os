import { Suspense, lazy, useState, useRef, useEffect } from 'react'
import { useTimer, PHASE } from '../hooks/useTimer'
import { useSettings } from '../hooks/useSettings'
import { appendSession, loadSessions, removeSessionById, generateId } from '../lib/sessionStorage'
import SessionHistory from './SessionHistory'
import SettingsModal from './SettingsModal'
import { Play, Pause, Square, Settings, Menu, X, SkipForward } from 'lucide-react'

const SessionAnalytics = lazy(() => import('./SessionAnalytics'))

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function getPhaseGradient(phase) {
  switch (phase) {
    case PHASE.WORK: return 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
    case PHASE.SHORT_BREAK: return 'linear-gradient(135deg, #1b3a29 0%, #112a1d 100%)'
    case PHASE.LONG_BREAK: return 'linear-gradient(135deg, #1a2a40 0%, #0f172a 100%)'
    default: return 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
  }
}

export default function Timer() {
  const { settings } = useSettings()
  const lastLoggedRef = useRef(0)
  const handlePhaseAutoComplete = (completedPhase, { actualSec, plannedSec, startedAt, endedAt }) => {
    if (completedPhase === PHASE.WORK) {
      const now = Date.now()
      // Guard against double logs triggered by React strict mode or interval race conditions
      if (now - lastLoggedRef.current < 2000) {
        return
      }
      lastLoggedRef.current = now

      const next = appendSession({
        id: generateId(),
        taskId: selectedTaskId,
        plannedSec,
        actualSec,
        startedAt,
        endedAt,
      })
      setSessions(next)
    }
  }

  const {
    remainingSeconds,
    isRunning,
    phase,
    currentSet,
    start,
    pause,
    stop,
    skipPhase,
    initialSecondsForPhase,
    phaseStartRef,
  } = useTimer(settings, handlePhaseAutoComplete)

  const [sessions, setSessions] = useState(() => loadSessions())
  const [selectedTaskId, setSelectedTaskId] = useState(settings.tasks[0]?.id || '')

  // UI States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  const isAtInitial = remainingSeconds === initialSecondsForPhase

  // Labels & Data Map
  const activeTask = settings.tasks.find((task) => task.id === selectedTaskId)
  const selectedTaskLabel = activeTask?.label || 'Deleted Task'
  const estimatedSets = activeTask?.estimatedSets || 0

  // Calculate completed sets for today for the *currently selected task*
  const todayTaskSets = sessions
    .filter((s) => s.taskId === selectedTaskId && new Date(s.endedAt).toDateString() === new Date().toDateString())
    .length

  let phaseLabel = 'Focus'
  let phaseColor = 'white'
  if (phase === PHASE.SHORT_BREAK) { phaseLabel = 'Short Break'; phaseColor = '#69db7c' }
  if (phase === PHASE.LONG_BREAK) { phaseLabel = 'Long Break'; phaseColor = '#4dabf7' }

  let statusText = isRunning ? 'Running' : isAtInitial ? 'Ready' : 'Paused'

  // Update background gradient based on phase
  useEffect(() => {
    document.body.style.background = getPhaseGradient(phase)
    document.body.style.transition = 'background 0.8s ease'
  }, [phase])

  // Calculate progress for the circular SVG
  const progressPercentage = (remainingSeconds / initialSecondsForPhase) * 100
  const circleRadius = 120
  const circleCircumference = 2 * Math.PI * circleRadius
  const strokeDashoffset = circleCircumference - (progressPercentage / 100) * circleCircumference

  const handleStop = () => {
    // Read timing from refs before stop() clears them
    const endedAtMs = Date.now()
    const startedAtMs = phaseStartRef.current ?? (endedAtMs - (initialSecondsForPhase - remainingSeconds) * 1000)
    const actualSec = Math.max(0, Math.round((endedAtMs - startedAtMs) / 1000))

    try {
      if (actualSec > 0 && phase === PHASE.WORK) {
        const next = appendSession({
          id: generateId(),
          taskId: selectedTaskId,
          plannedSec: initialSecondsForPhase,
          actualSec,
          startedAt: new Date(startedAtMs).toISOString(),
          endedAt: new Date(endedAtMs).toISOString(),
        })
        setSessions(next)
      }
    } finally {
      stop()
    }
  }

  const handleDeleteSession = (sessionId) => {
    const targetSession = sessions.find((session) => session.id === sessionId)
    const targetTaskLabel = settings.tasks.find((task) => task.id === targetSession?.taskId)?.label
    const shouldDelete = window.confirm(
      `${targetTaskLabel ? `${targetTaskLabel} のセッション` : 'このセッション'}を削除しますか？`,
    )
    if (!shouldDelete) return

    const next = removeSessionById(sessionId)
    setSessions(next)
  }

  const todayTotalSec = sessions
    .filter((session) => new Date(session.endedAt).toDateString() === new Date().toDateString())
    .reduce((sum, session) => sum + session.actualSec, 0)

  return (
    <>
      {/* Top Navigation */}
      <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 50, display: 'flex', gap: '0.5rem' }}>
        <button className="glass-panel" onClick={() => setIsSettingsOpen(true)} style={{ padding: '0.75rem', borderRadius: '50%', border: 'none' }} title="Settings">
          <Settings size={24} />
        </button>
        <button className="glass-panel" onClick={() => setIsHistoryOpen(true)} style={{ padding: '0.75rem', borderRadius: '50%', border: 'none' }} title="History & Analytics">
          <Menu size={24} />
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0 1rem' }}>

        {/* Main Timer Panel */}
        <section className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem', gap: '1rem' }}>

          {phase === PHASE.WORK && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
              {settings.tasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => setSelectedTaskId(task.id)}
                  disabled={isRunning || !isAtInitial}
                  className={`task-pill ${selectedTaskId === task.id ? 'active' : ''}`}
                >
                  {task.label}
                </button>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', position: 'relative', width: '300px', height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {/* SVG Circular Progress Background */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <circle
                cx="150" cy="150" r={circleRadius}
                fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"
              />
              <circle
                cx="150" cy="150" r={circleRadius}
                fill="none" stroke={phaseColor} strokeWidth="8"
                strokeLinecap="round"
                className="timer-ring-circle"
                style={{
                  strokeDasharray: circleCircumference,
                  strokeDashoffset: strokeDashoffset,
                }}
              />
            </svg>

            <div style={{ zIndex: 10 }}>
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '500', color: phaseColor, letterSpacing: '2px', textTransform: 'uppercase' }}>
                {phaseLabel}
              </p>
              <h1 style={{ fontSize: '4.5rem', fontWeight: '300', margin: '0.2rem 0', lineHeight: '1', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                {formatTime(remainingSeconds)}
              </h1>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', opacity: 0.9, fontSize: '1rem', fontWeight: '400', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.8rem', borderRadius: '12px', fontSize: '0.9rem' }}>
                  {statusText}
                </span>
                <span>
                  Set {currentSet} / {settings.setsBeforeLongBreak}
                </span>
              </div>

              {phase === PHASE.WORK && (
                <div style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.25rem' }}>
                  Next: {currentSet >= settings.setsBeforeLongBreak ? `Long Break (${settings.longBreakDuration}m)` : `Short Break (${settings.shortBreakDuration}m)`}
                </div>
              )}

              {phase === PHASE.WORK && estimatedSets > 0 && (
                <div style={{ marginTop: '0.25rem', opacity: 0.85 }}>
                  <span style={{ fontSize: '0.95rem' }}>
                    {selectedTaskLabel}: {todayTaskSets} / {estimatedSets} Sets
                  </span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '2rem' }}>
            <button
              onClick={start}
              disabled={isRunning || remainingSeconds === 0}
              style={{ width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, background: 'rgba(255,255,255,0.25)' }}
            >
              <Play size={36} fill="currentColor" style={{ marginLeft: '4px' }} />
            </button>
            <button
              onClick={pause}
              disabled={!isRunning}
              style={{ width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
            >
              <Pause size={28} fill="currentColor" />
            </button>
            <button
              onClick={handleStop}
              disabled={isAtInitial}
              style={{ width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
            >
              <Square size={24} fill="currentColor" />
            </button>
            <button
              onClick={skipPhase}
              style={{ width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, background: 'transparent' }}
              title="Skip Phase"
            >
              <SkipForward size={24} />
            </button>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <span>Today: {Math.floor(todayTotalSec / 60)}m</span>
              <span style={{ opacity: 0.7 }}>Goal: {settings.dailyGoalMinutes}m</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                background: todayTotalSec / 60 >= settings.dailyGoalMinutes ? '#69db7c' : 'white',
                width: `${Math.min(100, ((todayTotalSec / 60) / settings.dailyGoalMinutes) * 100)}%`,
                transition: 'width 0.5s ease-out'
              }} />
            </div>
          </div>
        </section>

      </div>

      {/* Settings Modal */}
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}

      {/* History & Analytics Offcanvas/Modal Menu */}
      {isHistoryOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 90,
          display: 'flex', justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)'
        }}>
          <div className="glass-panel" style={{
            width: '100%', maxWidth: '450px', height: '100%',
            borderRadius: '20px 0 0 20px', borderRight: 'none',
            overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem',
            padding: '2rem', backgroundColor: 'rgba(15,15,15,0.85)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>Activity</h2>
              <button onClick={() => setIsHistoryOpen(false)} style={{ padding: '0.5rem', background: 'transparent', border: 'none' }}>
                <X size={28} />
              </button>
            </div>

            <Suspense fallback={<p style={{ textAlign: 'center', color: 'white' }}>Loading analytics...</p>}>
              <SessionAnalytics sessions={sessions} taskOptions={settings.tasks} settings={settings} />
            </Suspense>

            <SessionHistory
              sessions={sessions}
              taskOptions={settings.tasks}
              onDeleteSession={handleDeleteSession}
            />
          </div>
        </div>
      )}
    </>
  )
}
