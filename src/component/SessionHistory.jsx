import { useState } from 'react'

function formatDateTime(isoString) {
  const date = new Date(isoString)
  return date.toLocaleString('ja-JP', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function toMinutes(seconds) {
  return Math.round(seconds / 60)
}

export default function SessionHistory({ sessions, taskOptions, onDeleteSession, limit = 10 }) {
  const [selectedHistoryTaskId, setSelectedHistoryTaskId] = useState('all')

  if (!sessions.length) {
    return null
  }

  const taskLabelMap = taskOptions.reduce((acc, task) => {
    acc[task.id] = task.label
    return acc
  }, {})

  let recentSessions = sessions

  if (selectedHistoryTaskId !== 'all') {
    recentSessions = recentSessions.filter(s => s.taskId === selectedHistoryTaskId)
  }

  recentSessions = recentSessions.slice(0, limit)

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '0.5rem' }}>
        <h3 style={{ margin: 0 }}>Session History</h3>

        <select
          value={selectedHistoryTaskId}
          onChange={(e) => setSelectedHistoryTaskId(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            padding: '0.3rem 0.5rem',
            borderRadius: '6px',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="all" style={{ color: 'black' }}>All Tasks</option>
          {taskOptions.map(task => (
            <option key={task.id} value={task.id} style={{ color: 'black' }}>{task.label}</option>
          ))}
        </select>
      </div>

      <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {recentSessions.map((session) => (
          <li key={session.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem' }}>
              <span style={{ fontWeight: 500, color: '#4dabf7' }}>{taskLabelMap[session.taskId] ?? session.taskId}</span>
              <span style={{ opacity: 0.8, fontSize: '0.8rem' }}>{formatDateTime(session.endedAt)}</span>
              <span style={{ opacity: 0.7, fontSize: '0.8rem' }}>Planned: {toMinutes(session.plannedSec)}m / Actual: {toMinutes(session.actualSec)}m</span>
            </div>
            <button
              type="button"
              onClick={() => onDeleteSession(session.id)}
              style={{ background: 'rgba(255,0,0,0.1)', color: '#ff6b6b', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '6px' }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
