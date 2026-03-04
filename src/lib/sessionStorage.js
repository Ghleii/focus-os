const STORAGE_KEY = 'focusos.sessions.v1'

export function loadSessions() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return []
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {}
    return []
  }
}

export function saveSessions(sessions) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
    return true
  } catch {
    return false
  }
}

export function appendSession(session) {
  const sessions = loadSessions()
  const next = [session, ...sessions]
  const saved = saveSessions(next)
  return saved ? next : sessions
}
