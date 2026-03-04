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
  if (!sessions.length) {
    return null
  }

  const taskLabelMap = taskOptions.reduce((acc, task) => {
    acc[task.id] = task.label
    return acc
  }, {})

  const recentSessions = sessions.slice(0, limit)

  return (
    <section>
      <h3>Session History</h3>
      <ul>
        {recentSessions.map((session) => (
          <li key={session.id}>
            {formatDateTime(session.endedAt)} / {taskLabelMap[session.taskId] ?? session.taskId} / Planned{' '}
            {toMinutes(session.plannedSec)} min / Actual {toMinutes(session.actualSec)} min
            <button type="button" onClick={() => onDeleteSession(session.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
