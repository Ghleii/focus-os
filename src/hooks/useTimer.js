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

  // Calculate initial seconds based on current phase
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
    setIsRunning(true)
  }

  const pause = () => {
    if (!isRunning) return
    clearTimer()
    setIsRunning(false)
  }

  const stop = () => {
    clearTimer()
    setIsRunning(false)
    setRemainingSeconds(getInitialSeconds(phase))
  }

  const skipPhase = () => {
    clearTimer()
    setIsRunning(false)
    handlePhaseComplete(true)
  }

  const handlePhaseComplete = (isSkip = false) => {
    // Play sound based on the phase that just finished
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
      nextSet = 1; // Reset sets after long break
    }

    setPhase(nextPhase)
    setCurrentSet(nextSet)
    setRemainingSeconds(getInitialSeconds(nextPhase))

    // Notify caller that phase completed with full duration
    if (onPhaseComplete && !isSkip) {
      onPhaseComplete(phase, getInitialSeconds(phase))
    }

    // Auto-start next session if enabled
    if (settings.autoStart !== false) {
      setIsRunning(true)
    }
  }

  useEffect(() => {
    if (!isRunning) return
    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearTimer()
          setIsRunning(false)
          // setTimeout prevents React state update warnings during render phase
          setTimeout(() => handlePhaseComplete(false), 0)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return clearTimer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, phase, currentSet, settings])

  return {
    remainingSeconds,
    isRunning,
    phase,
    currentSet,
    start,
    pause,
    stop,
    skipPhase,
    initialSecondsForPhase: getInitialSeconds(phase)
  }
}
