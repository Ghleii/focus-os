const STORAGE_KEY = 'focusos.sessions.v1'

export function loadSessions() {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : []
}

export function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

export function appendSession(session) {
  const sessions = loadSessions()
  const next = [session, ...sessions]
  saveSessions(next)
  return next
}