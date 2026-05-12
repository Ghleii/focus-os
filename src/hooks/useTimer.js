import { useEffect, useRef, useState } from 'react'

const base = import.meta.env.BASE_URL
const WORK_AUDIO = typeof Audio !== 'undefined' ? new Audio(`${base}sounds/work.mp3`) : null
const BREAK_AUDIO = typeof Audio !== 'undefined' ? new Audio(`${base}sounds/break.mp3`) : null

export const PHASE = {
  WORK: 'WORK',
  SHORT_BREAK: 'SHORT_BREAK',
  LONG_BREAK: 'LONG_BREAK'
}

export function useTimer(settings, onPhaseComplete) {
  const [phase, setPhase] = useState(PHASE.WORK)
  const [currentSet, setCurrentSet] = useState(1)

  const getInitialSeconds = (currentPhase) => {
    switch (currentPhase) {
      case PHASE.WORK: return settings.workDuration * 60;
      case PHASE.SHORT_BREAK: return settings.shortBreakDuration * 60;
      case PHASE.LONG_BREAK: return settings.longBreakDuration * 60;
      default: return 25 * 60;
    }
  }

  const [remainingSeconds, setRemainingSeconds] = useState(() => getInitialSeconds(PHASE.WORK))
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef(null)
  const prevInitialSecondsRef = useRef(getInitialSeconds(PHASE.WORK))

  // Deadline-based timing refs — source of truth for remaining time
  const deadlineRef = useRef(null)          // absolute ms when phase ends
  const remainingMsAtPauseRef = useRef(null) // ms remaining when paused
  const phaseStartRef = useRef(null)         // "virtual start" ms (adjusted for pauses)
  const plannedSecRef = useRef(null)         // initial seconds captured at phase start

  // Update remaining seconds if settings change while stopped
  useEffect(() => {
    const newInitial = getInitialSeconds(phase)
    if (!isRunning && remainingSeconds === prevInitialSecondsRef.current) {
      setRemainingSeconds(newInitial)
    }
    prevInitialSecondsRef.current = newInitial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, phase, remainingSeconds])

  const clearTimer = () => {
    if (!intervalRef.current) return
    clearInterval(intervalRef.current)
    intervalRef.current = null
  }

  const start = () => {
    if (isRunning) return
    const totalMs = getInitialSeconds(phase) * 1000
    const remainingMs = remainingMsAtPauseRef.current ?? remainingSeconds * 1000
    const elapsedMs = totalMs - remainingMs
    deadlineRef.current = Date.now() + remainingMs
    // "Virtual start" = when this phase would have begun if unpaused throughout
    phaseStartRef.current = Date.now() - elapsedMs
    if (plannedSecRef.current === null) {
      plannedSecRef.current = getInitialSeconds(phase)
    }
    remainingMsAtPauseRef.current = null
    setIsRunning(true)
  }

  const pause = () => {
    if (!isRunning) return
    remainingMsAtPauseRef.current = Math.max(0, deadlineRef.current - Date.now())
    clearTimer()
    setIsRunning(false)
  }

  const stop = () => {
    clearTimer()
    deadlineRef.current = null
    remainingMsAtPauseRef.current = null
    phaseStartRef.current = null
    plannedSecRef.current = null
    setIsRunning(false)
    setRemainingSeconds(getInitialSeconds(phase))
  }

  const skipPhase = () => {
    clearTimer()
    setIsRunning(false)
    deadlineRef.current = null
    remainingMsAtPauseRef.current = null
    phaseStartRef.current = null
    plannedSecRef.current = null
    handlePhaseComplete(true)
  }

  const handlePhaseComplete = (isSkip = false) => {
    if (phase === PHASE.WORK && WORK_AUDIO) {
      WORK_AUDIO.currentTime = 0;
      WORK_AUDIO.play().catch(e => console.log('Audio play failed:', e));
    } else if (phase !== PHASE.WORK && BREAK_AUDIO) {
      BREAK_AUDIO.currentTime = 0;
      BREAK_AUDIO.play().catch(e => console.log('Audio play failed:', e));
    }

    let nextPhase = phase;
    let nextSet = currentSet;

    if (phase === PHASE.WORK) {
      if (currentSet >= settings.setsBeforeLongBreak) {
        nextPhase = PHASE.LONG_BREAK;
      } else {
        nextPhase = PHASE.SHORT_BREAK;
      }
    } else if (phase === PHASE.SHORT_BREAK) {
      nextPhase = PHASE.WORK;
      nextSet = currentSet + 1;
    } else if (phase === PHASE.LONG_BREAK) {
      nextPhase = PHASE.WORK;
      nextSet = 1;
    }

    // Pass real elapsed timing — not re-derived from settings at completion time
    if (onPhaseComplete && !isSkip) {
      const endedAtMs = Date.now()
      const startedAtMs = phaseStartRef.current ?? endedAtMs
      const actualSec = Math.max(0, Math.round((endedAtMs - startedAtMs) / 1000))
      const plannedSec = plannedSecRef.current ?? getInitialSeconds(phase)
      onPhaseComplete(phase, {
        actualSec,
        plannedSec,
        startedAt: new Date(startedAtMs).toISOString(),
        endedAt: new Date(endedAtMs).toISOString(),
      })
    }

    // Clear phase refs before transitioning
    phaseStartRef.current = null
    deadlineRef.current = null
    plannedSecRef.current = null

    setPhase(nextPhase)
    setCurrentSet(nextSet)
    setRemainingSeconds(getInitialSeconds(nextPhase))

    // Auto-start next phase — set deadline before flipping isRunning
    if (settings.autoStart !== false) {
      const newPhaseSec = getInitialSeconds(nextPhase)
      deadlineRef.current = Date.now() + newPhaseSec * 1000
      phaseStartRef.current = Date.now()
      plannedSecRef.current = newPhaseSec
      remainingMsAtPauseRef.current = null
      setIsRunning(true)
    }
  }

  // Deadline-based countdown tick — setInterval is only a UI refresh driver
  useEffect(() => {
    if (!isRunning) return

    const tick = () => {
      const msLeft = deadlineRef.current - Date.now()
      const secLeft = Math.max(0, Math.ceil(msLeft / 1000))
      setRemainingSeconds(secLeft)
      if (msLeft <= 0) {
        clearTimer()
        setIsRunning(false)
        // setTimeout prevents React state update warnings during render phase
        setTimeout(() => handlePhaseComplete(false), 0)
      }
    }

    tick() // sync immediately so display doesn't lag by up to 250ms
    intervalRef.current = setInterval(tick, 250)
    return clearTimer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, phase, currentSet, settings])

  // Snap to correct time instantly when returning to a backgrounded tab
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible' || !isRunning || !deadlineRef.current) return
      const msLeft = deadlineRef.current - Date.now()
      const secLeft = Math.max(0, Math.ceil(msLeft / 1000))
      setRemainingSeconds(secLeft)
      if (msLeft <= 0) {
        clearTimer()
        setIsRunning(false)
        setTimeout(() => handlePhaseComplete(false), 0)
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning])

  return {
    remainingSeconds,
    isRunning,
    phase,
    currentSet,
    start,
    pause,
    stop,
    skipPhase,
    initialSecondsForPhase: getInitialSeconds(phase),
    phaseStartRef, // expose ref so Timer.jsx can read .current at click time
  }
}
