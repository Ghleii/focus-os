import { useState } from 'react'
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

function buildTaskData(sessions, taskOptions) {
  const totalsByTask = sessions.reduce((acc, session) => {
    const taskId = session.taskId

    if (!acc[taskId]) {
      acc[taskId] = {
        actualSec: 0,
        label: taskOptions.find(t => t.id === taskId)?.label || taskId,
        estimatedSets: taskOptions.find(t => t.id === taskId)?.estimatedSets || 0
      }
    }

    acc[taskId].actualSec += session.actualSec
    return acc
  }, {})

  return Object.values(totalsByTask)
    .map((taskData) => ({
      task: taskData.label,
      actual: Math.round(taskData.actualSec / 60),
      estimated: (taskData.estimatedSets * 25) // Default to 25 mins per estimated set for chart scale
    }))
    .sort((a, b) => b.actual - a.actual)
}

function buildTimelineData(sessions) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todaySessions = sessions.filter(s => {
    const d = new Date(s.endedAt)
    return d.getTime() >= today.getTime()
  })

  return todaySessions.map((s, index) => {
    const start = new Date(s.startedAt)
    const end = new Date(s.endedAt)
    return {
      id: s.id,
      index: index + 1,
      name: `Session ${index + 1}`,
      duration: Math.round(s.actualSec / 60),
      timeRange: `${start.getHours()}:${String(start.getMinutes()).padStart(2, '0')} - ${end.getHours()}:${String(end.getMinutes()).padStart(2, '0')}`
    }
  })
}

export default function SessionAnalytics({ sessions, taskOptions }) {
  const [activeTab, setActiveTab] = useState('daily')
  const [selectedChartTaskId, setSelectedChartTaskId] = useState('all')

  if (!sessions.length) {
    return (
      <section>
        <h3>Analytics</h3>
        <p>No sessions yet.</p>
      </section>
    )
  }

  const dailyData = buildDailyData(sessions)
  let taskData = buildTaskData(sessions, taskOptions)

  // Filter taskData if a specific task is selected
  if (selectedChartTaskId !== 'all') {
    const selectedLabel = taskOptions.find(t => t.id === selectedChartTaskId)?.label
    taskData = taskData.filter(d => d.task === selectedLabel)
  }

  const timelineData = buildTimelineData(sessions)

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Analytics</h3>

        {/* Segmented Control / Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.25rem', gap: '0.25rem' }}>
          {['daily', 'tasks', 'timeline'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '0.5rem',
                background: activeTab === tab ? 'rgba(255,255,255,0.2)' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.6)',
                fontWeight: activeTab === tab ? '600' : '400',
                transition: 'all 0.2s',
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'daily' && (
        <div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '8px', color: '#000000', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                itemStyle={{ color: '#000000', fontWeight: '500' }}
              />
              <Bar dataKey="minutes" name="Focus (min)" fill="#69db7c" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h4 style={{ margin: 0 }}>Estimation vs Actual (by Task)</h4>
            <select
              value={selectedChartTaskId}
              onChange={(e) => setSelectedChartTaskId(e.target.value)}
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
          <ResponsiveContainer width="100%" height={Math.max(250, taskData.length * 40 + 50)}>
            <BarChart data={taskData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="task" type="category" width={80} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '8px', color: '#000000', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                itemStyle={{ color: '#000000', fontWeight: '500' }}
              />
              <Legend />
              <Bar dataKey="estimated" name="Planned (min)" fill="#666666" />
              <Bar dataKey="actual" name="Actual (min)" fill="#4dabf7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div>
          <h4>Today's Timeline</h4>
          {timelineData.length === 0 ? (
            <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>No sessions yet today.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {timelineData.map(item => (
                <div key={item.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffc078' }}></div>
                  <span style={{ fontSize: '0.9rem' }}>{item.timeRange}</span>
                  <span style={{ fontWeight: 'bold' }}>{item.duration} min</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
