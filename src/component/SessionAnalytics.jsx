import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function formatDayLabel(date) {
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function buildDailyData(sessions) {
  const today = new Date()
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today)
    day.setHours(0, 0, 0, 0)
    day.setDate(today.getDate() - (6 - index))
    return day
  })

  return days.map((day) => {
    const dayStart = day.getTime()
    const dayEnd = dayStart + 24 * 60 * 60 * 1000

    const totalSec = sessions
      .filter((session) => {
        const endedAt = new Date(session.endedAt).getTime()
        return endedAt >= dayStart && endedAt < dayEnd
      })
      .reduce((sum, session) => sum + session.actualSec, 0)

    return {
      day: formatDayLabel(day),
      minutes: Math.round(totalSec / 60),
    }
  })
}

function buildPlanVsActualData(sessions) {
  const totals = sessions.reduce(
    (acc, session) => {
      acc.plannedSec += session.plannedSec
      acc.actualSec += session.actualSec
      return acc
    },
    { plannedSec: 0, actualSec: 0 },
  )

  return [
    {
      label: 'All Sessions',
      planned: Math.round(totals.plannedSec / 60),
      actual: Math.round(totals.actualSec / 60),
    },
  ]
}

function buildTaskData(sessions, taskOptions) {
  const taskLabelMap = taskOptions.reduce((acc, task) => {
    acc[task.id] = task.label
    return acc
  }, {})

  const totalsByTask = sessions.reduce((acc, session) => {
    const taskId = session.taskId
    const taskLabel = taskLabelMap[taskId] ?? taskId

    if (!acc[taskLabel]) {
      acc[taskLabel] = 0
    }

    acc[taskLabel] += session.actualSec
    return acc
  }, {})

  return Object.entries(totalsByTask)
    .map(([task, totalSec]) => ({
      task,
      minutes: Math.round(totalSec / 60),
    }))
    .sort((a, b) => b.minutes - a.minutes)
}

export default function SessionAnalytics({ sessions, taskOptions }) {
  if (!sessions.length) {
    return (
      <section>
        <h3>Analytics</h3>
        <p>No sessions yet.</p>
      </section>
    )
  }

  const dailyData = buildDailyData(sessions)
  const planVsActualData = buildPlanVsActualData(sessions)
  const taskData = buildTaskData(sessions, taskOptions)

  return (
    <section>
      <h3>Analytics</h3>

      <h4>Daily Focus (Last 7 days)</h4>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={dailyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="minutes" name="Focus (min)" fill="currentColor" />
        </BarChart>
      </ResponsiveContainer>

      <h4>Planned vs Actual</h4>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={planVsActualData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="planned" name="Planned (min)" fill="currentColor" fillOpacity={0.35} />
          <Bar dataKey="actual" name="Actual (min)" fill="currentColor" />
        </BarChart>
      </ResponsiveContainer>

      <h4>Focus by Task</h4>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={taskData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="task" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="minutes" name="Focus (min)" fill="currentColor" />
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}
