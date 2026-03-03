import { useEffect, useRef, useState } from "react";

export function useTimer(initialSeconds = 1500) {
    const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds)
    const [isRunning, setIsRunning] = useState(false)
    const intervalRef = useRef(null)

    const start = () => {
        if (isRunning) return
        setIsRunning(true)
    }

    const pause = () => {
        if (!isRunning) return
        setIsRunning(false)
    }

    const stop = () => {
        if (remainingSeconds === initialSeconds) return
        setIsRunning(false)
        setRemainingSeconds(initialSeconds)
    }

    useEffect(() => {
        if (!isRunning) return
        intervalRef.current = setInterval(() => {
            setRemainingSeconds(prev => {
                if (prev <= 1) {
                    setIsRunning(false)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(intervalRef.current)
    }, [isRunning])

    useEffect(() => {
        console.log({ remainingSeconds, isRunning })
    }, [remainingSeconds, isRunning])

  return { remainingSeconds, isRunning, start, pause, stop }
}