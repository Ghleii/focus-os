import { useState } from 'react'
import { Plus, X, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { useSettings } from '../hooks/useSettings'
import { generateId } from '../lib/sessionStorage'

function NumberInput({ value, onChange, onBlur, min, max, step = 1, style, suffix }) {
    const handleDecrement = () => {
        const current = value || min
        const next = Math.max(min, current - step)
        onChange({ target: { value: next } })
        if (onBlur) setTimeout(onBlur, 0)
    }

    const handleIncrement = () => {
        const current = value || min
        const next = Math.min(max, current + step)
        onChange({ target: { value: next } })
        if (onBlur) setTimeout(onBlur, 0)
    }

    const handleChange = (e) => {
        const val = e.target.value
        if (val === '') {
            onChange({ target: { value: '' } })
            return
        }
        const num = Number(val)
        if (!isNaN(num)) {
            onChange({ target: { value: num } })
        }
    }

    return (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', paddingRight: '1.25rem', overflow: 'hidden', ...style }}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    onBlur={onBlur}
                    style={{ background: 'transparent', border: 'none', color: 'white', padding: '0.4rem 0.5rem', width: '100%', textAlign: 'center', outline: 'none', fontSize: '1rem' }}
                />
                {suffix && <span style={{ paddingRight: '0.5rem', opacity: 0.7, fontSize: '0.9rem' }}>{suffix}</span>}
            </div>

            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', width: '1.25rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                <button type="button" onClick={handleIncrement} style={{ flex: 1, padding: 0, background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0 }}>
                    <ChevronUp size={12} />
                </button>
                <button type="button" onClick={handleDecrement} style={{ flex: 1, padding: 0, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0 }}>
                    <ChevronDown size={12} />
                </button>
            </div>
        </div>
    )
}

export default function SettingsModal({ onClose }) {
    const { settings, updateSettings } = useSettings()
    const [newTaskLabel, setNewTaskLabel] = useState('')
    const [newEstimatedSets, setNewEstimatedSets] = useState(1)

    const handleAddTask = () => {
        const trimmedLabel = newTaskLabel.trim()
        if (!trimmedLabel) return
        if (settings.tasks.some(t => t.label === trimmedLabel)) {
            alert('そのタスクは既に存在します。')
            return
        }
        const newTask = {
            id: generateId(),
            label: trimmedLabel,
            estimatedSets: newEstimatedSets
        }
        updateSettings({
            tasks: [...settings.tasks, newTask]
        })
        setNewTaskLabel('')
        setNewEstimatedSets(1)
    }

    const handleDeleteTask = (taskId) => {
        updateSettings({
            tasks: settings.tasks.filter(t => t.id !== taskId)
        })
    }

    const handleUpdateEstimatedSets = (taskId, newSets) => {
        updateSettings({
            tasks: settings.tasks.map(t => t.id === taskId ? { ...t, estimatedSets: newSets } : t)
        })
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            padding: '1rem'
        }}>
            <div className="glass-panel" style={{
                width: '100%', maxWidth: '500px', maxHeight: '90vh',
                overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem',
                backgroundColor: 'rgba(20,20,20,0.85)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0 }}>Settings</h2>
                    <button onClick={onClose} style={{ padding: '0.25rem', background: 'transparent', border: 'none' }}>
                        <X size={24} />
                    </button>
                </div>

                <div>
                    <h3>Timer Durations (minutes)</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span>Work (m)</span>
                            <NumberInput
                                min={1} max={120}
                                value={settings.workDuration}
                                onChange={(e) => updateSettings({ workDuration: e.target.value === '' ? '' : Number(e.target.value) })}
                                onBlur={() => { if (!settings.workDuration) updateSettings({ workDuration: 25 }) }}
                            />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span>Short Break (m)</span>
                            <NumberInput
                                min={1} max={60}
                                value={settings.shortBreakDuration}
                                onChange={(e) => updateSettings({ shortBreakDuration: e.target.value === '' ? '' : Number(e.target.value) })}
                                onBlur={() => { if (!settings.shortBreakDuration) updateSettings({ shortBreakDuration: 5 }) }}
                            />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span>Long Break (m)</span>
                            <NumberInput
                                min={1} max={60}
                                value={settings.longBreakDuration}
                                onChange={(e) => updateSettings({ longBreakDuration: e.target.value === '' ? '' : Number(e.target.value) })}
                                onBlur={() => { if (!settings.longBreakDuration) updateSettings({ longBreakDuration: 15 }) }}
                            />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span>Sets before Long Break</span>
                            <NumberInput
                                min={1} max={10}
                                value={settings.setsBeforeLongBreak}
                                onChange={(e) => updateSettings({ setsBeforeLongBreak: e.target.value === '' ? '' : Number(e.target.value) })}
                                onBlur={() => { if (!settings.setsBeforeLongBreak) updateSettings({ setsBeforeLongBreak: 4 }) }}
                            />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', gridColumn: 'span 2' }}>
                            <span>Daily Goal (minutes)</span>
                            <NumberInput
                                min={1} max={1440} step={10}
                                value={settings.dailyGoalMinutes}
                                onChange={(e) => updateSettings({ dailyGoalMinutes: e.target.value === '' ? '' : Number(e.target.value) })}
                                onBlur={() => { if (!settings.dailyGoalMinutes) updateSettings({ dailyGoalMinutes: 120 }) }}
                            />
                        </label>
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)' }} />

                <div>
                    <h3>Tasks & Estimations</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                        {settings.tasks.map(task => (
                            <div key={task.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                                <span>{task.label}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <NumberInput
                                        min={1} max={20}
                                        value={task.estimatedSets || 1}
                                        onChange={(e) => handleUpdateEstimatedSets(task.id, e.target.value === '' ? '' : Number(e.target.value))}
                                        onBlur={() => { if (!task.estimatedSets) handleUpdateEstimatedSets(task.id, 1) }}
                                        style={{ width: '100px' }}
                                        suffix="sets"
                                    />
                                </div>
                                <button onClick={() => handleDeleteTask(task.id)} style={{ padding: '0.25rem', background: 'transparent', border: 'none', color: '#ff6b6b' }}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
                            <input
                                type="text"
                                placeholder="New task name"
                                value={newTaskLabel}
                                onChange={(e) => setNewTaskLabel(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                                style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.5rem', borderRadius: '8px' }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <NumberInput
                                    min={1} max={20}
                                    value={newEstimatedSets}
                                    onChange={(e) => setNewEstimatedSets(e.target.value === '' ? '' : Number(e.target.value))}
                                    onBlur={() => { if (!newEstimatedSets) setNewEstimatedSets(1) }}
                                    style={{ width: '100px' }}
                                    suffix="sets"
                                />
                            </div>
                            <button onClick={handleAddTask} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', marginLeft: '0.25rem' }}>
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
