import { createContext, useContext, useState, useEffect } from 'react'

const SETTINGS_STORAGE_KEY = 'focusos.settings.v1'

const defaultSettings = {
    tasks: [
        { id: 'task-1', label: 'Deep Work', estimatedSets: 4 },
        { id: 'task-2', label: 'Study', estimatedSets: 2 },
        { id: 'task-3', label: 'Reading', estimatedSets: 1 },
    ],
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    setsBeforeLongBreak: 4,
    dailyGoalMinutes: 120, // Daily goal in minutes (default 2 hours)
    autoStart: true, // auto-start next session
}

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(() => {
        if (typeof window === 'undefined') return defaultSettings
        const saved = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
        if (saved) {
            try {
                return { ...defaultSettings, ...JSON.parse(saved) }
            } catch (e) {
                return defaultSettings
            }
        }
        return defaultSettings
    })

    useEffect(() => {
        if (typeof window === 'undefined' || !window.localStorage) return
        try {
            window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
        } catch {
            // Ignore persistence errors (e.g., quota exceeded, disabled storage)
        }
    }, [settings])

    const updateSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }))
    }

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {
    const context = useContext(SettingsContext)
    if (!context) throw new Error('useSettings must be used within SettingsProvider')
    return context
}
