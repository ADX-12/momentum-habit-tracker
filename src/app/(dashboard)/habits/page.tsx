'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Flame, Trophy, Calendar, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/store';
import { calculateStreak, getHeatmapData } from '@/lib/date';

function HeatMap({ logs }: { logs: any[] }) {
  const data = getHeatmapData(logs, 16);
  const weeks: typeof data[number][][] = [];
  let week: typeof data[number][] = [];
  data.forEach((d, i) => {
    week.push(d);
    if (week.length === 7 || i === data.length - 1) { weeks.push(week); week = []; }
  });

  const getColor = (status?: string, count?: number) => {
    if (status === 'completed' || count === 1) return '#7c3aed';
    if (status === 'skipped') return '#f59e0b44';
    return 'var(--bg-tertiary)';
  };

  return (
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      {weeks.map((w, wi) => (
        <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {w.map((d, di) => (
            <div
              key={di}
              className="heatmap-cell"
              title={`${d.date}: ${d.status || 'no data'}`}
              style={{ width: 12, height: 12, background: getColor(d.status, d.count) }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function HabitsPage() {
  const { habits, habitLogs, addHabit, deleteHabit } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [newHabit, setNewHabit] = useState({ title: '', icon: '📌', frequency: 'daily', target_value: 1, unit: '', start_date: new Date().toISOString().split('T')[0] });

  const today = new Date().toISOString().split('T')[0];

  const habitsWithData = useMemo(() => habits.map(habit => {
    const logs = habitLogs.filter(l => l.habit_id === habit.id);
    const streak = calculateStreak(logs);
    const todayLog = logs.find(l => l.log_date === today);
    return { ...habit, streak, todayLog };
  }), [habits, habitLogs, today]);

  const { logHabit } = useAppStore();

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.title) return;
    addHabit({ ...newHabit, is_active: true, frequency: newHabit.frequency as any });
    setShowForm(false);
    setNewHabit({ title: '', icon: '📌', frequency: 'daily', target_value: 1, unit: '', start_date: new Date().toISOString().split('T')[0] });
  };

  const ICONS = ['💧', '📚', '🏃', '💪', '🧘', '💻', '🎯', '💰', '🛌', '🥗', '☕', '🎵', '✍️', '🌅', '🧠', '📝'];

  const overallStats = useMemo(() => {
    const totalLogs = habitLogs.filter(l => l.log_date === today);
    const completed = totalLogs.filter(l => l.status === 'completed').length;
    const bestStreak = Math.max(...habitsWithData.map(h => h.streak.currentStreak), 0);
    const longestEver = Math.max(...habitsWithData.map(h => h.streak.longestStreak), 0);
    return { completed, total: habits.length, bestStreak, longestEver };
  }, [habits, habitLogs, habitsWithData, today]);

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Habits</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Build consistency, one day at a time</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ gap: 8 }}>
          <Plus size={16} /> New Habit
        </button>
      </div>

      {/* Stats */}
      <div className="card-grid card-grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: "Today's Done", value: `${overallStats.completed}/${overallStats.total}`, icon: <CheckCircle2 size={20} />, color: 'var(--emerald)' },
          { label: 'Best Streak', value: `${overallStats.bestStreak} 🔥`, icon: <Flame size={20} />, color: 'var(--amber)' },
          { label: 'Longest Ever', value: `${overallStats.longestEver} 🏆`, icon: <Trophy size={20} />, color: 'var(--accent-light)' },
          { label: 'Active Habits', value: habits.filter(h => h.is_active).length, icon: <Calendar size={20} />, color: 'var(--indigo)' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="glass" style={{ padding: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, marginBottom: 10 }}>{icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* New habit form */}
      {showForm && (
        <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Create New Habit</h3>
          <form onSubmit={handleAddHabit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Habit Name *</label>
                <input className="input" value={newHabit.title} onChange={e => setNewHabit(h => ({ ...h, title: e.target.value }))} placeholder="e.g. Read 20 minutes" required />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Frequency</label>
                <select className="input" value={newHabit.frequency} onChange={e => setNewHabit(h => ({ ...h, frequency: e.target.value }))} style={{ cursor: 'pointer' }}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Icon</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {ICONS.map(icon => (
                  <button key={icon} type="button" onClick={() => setNewHabit(h => ({ ...h, icon }))}
                    style={{
                      width: 36, height: 36, borderRadius: 8, border: `2px solid ${newHabit.icon === icon ? 'var(--accent)' : 'var(--border)'}`,
                      background: newHabit.icon === icon ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
                      fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >{icon}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Target</label>
                <input type="number" className="input" value={newHabit.target_value} onChange={e => setNewHabit(h => ({ ...h, target_value: Number(e.target.value) }))} min={1} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Unit</label>
                <input className="input" value={newHabit.unit} onChange={e => setNewHabit(h => ({ ...h, unit: e.target.value }))} placeholder="min, glasses, km..." />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Start Date</label>
                <input type="date" className="input" value={newHabit.start_date} onChange={e => setNewHabit(h => ({ ...h, start_date: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Create Habit</button>
            </div>
          </form>
        </div>
      )}

      {/* Habits list */}
      {habitsWithData.length === 0 ? (
        <div className="glass" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>No habits yet</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>Create your first habit to start building consistency</div>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">+ Create Habit</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {habitsWithData.map(habit => {
            const isDone = habit.todayLog?.status === 'completed';
            const isSkipped = habit.todayLog?.status === 'skipped';
            const logs = habitLogs.filter(l => l.habit_id === habit.id);
            const completionPct = habit.streak.completionRate;

            return (
              <div key={habit.id} className="glass" style={{ padding: 20 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {/* Check + icon */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => logHabit(habit.id, today, isDone ? 'missed' : 'completed')}
                      style={{
                        width: 44, height: 44, borderRadius: 12,
                        border: `2px solid ${isDone ? 'var(--emerald)' : 'var(--border)'}`,
                        background: isDone ? 'var(--emerald)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all var(--transition)', fontSize: 20,
                        color: isDone ? 'white' : 'transparent',
                      }}
                      aria-label={`Mark ${habit.title} as ${isDone ? 'incomplete' : 'complete'}`}
                    >
                      {isDone ? '✓' : habit.icon}
                    </button>
                    {!isDone && <span style={{ fontSize: 20 }}>{!isDone ? habit.icon : ''}</span>}
                  </div>

                  {/* Main info */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                      <Link href={`/habits/${habit.id}`} style={{ fontSize: 16, fontWeight: 700, color: isDone ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none' }}>
                        {habit.title}
                      </Link>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 4 }}>
                        {habit.frequency}
                      </span>
                      {isDone && <span style={{ fontSize: 11, color: 'var(--emerald)', fontWeight: 700 }}>✓ Done!</span>}
                      {isSkipped && <span style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 700 }}>Skipped</span>}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      Target: {habit.target_value} {habit.unit} per {habit.frequency === 'daily' ? 'day' : habit.frequency === 'weekly' ? 'week' : 'session'}
                    </div>
                    {/* Heatmap */}
                    <div style={{ marginTop: 12 }}>
                      <HeatMap logs={logs} />
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--amber)' }}>{habit.streak.currentStreak}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>🔥 Streak</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-light)' }}>{habit.streak.longestStreak}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>🏆 Best</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--emerald)' }}>{Math.round(completionPct)}%</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Rate</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {!isDone && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                    <button onClick={() => logHabit(habit.id, today, 'completed')} className="btn btn-secondary btn-sm" style={{ color: 'var(--emerald)' }}>
                      ✓ Complete
                    </button>
                    <button onClick={() => logHabit(habit.id, today, 'skipped')} className="btn btn-ghost btn-sm">
                      Skip today
                    </button>
                    <Link href={`/habits/${habit.id}`} className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>
                      Details →
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
