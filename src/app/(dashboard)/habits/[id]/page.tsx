'use client';
import { use, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Flame, Trophy, BarChart3, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store';
import { calculateStreak, getHeatmapData, formatDate } from '@/lib/date';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

function HeatMap({ logs }: { logs: any[] }) {
  const data = getHeatmapData(logs, 26);
  const weeks: typeof data[number][][] = [];
  let week: typeof data[number][] = [];
  data.forEach((d, i) => { week.push(d); if (week.length === 7 || i === data.length - 1) { weeks.push(week); week = []; } });
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const getColor = (status?: string) => status === 'completed' ? '#7c3aed' : status === 'skipped' ? '#f59e0b44' : 'var(--bg-tertiary)';

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: 3, minWidth: 'max-content' }}>
        {weeks.map((w, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {w.map((d, di) => (
              <div key={di} className="heatmap-cell" title={`${d.date}: ${d.status || 'no data'}`}
                style={{ width: 14, height: 14, background: getColor(d.status) }} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8, fontSize: 10, color: 'var(--text-muted)' }}>
        <span>Less</span>
        {[0, 0.3, 0.6, 1].map((op, i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: 2, background: op === 0 ? 'var(--bg-tertiary)' : `rgba(124,58,237,${op})` }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export default function HabitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { habits, habitLogs, logHabit, deleteHabit } = useAppStore();
  const router = useRouter();

  const habit = habits.find(h => h.id === id);
  if (!habit) return (
    <div className="fade-in" style={{ textAlign: 'center', padding: 80 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
      <h2 style={{ fontSize: 20, color: 'var(--text-secondary)', marginBottom: 16 }}>Habit not found</h2>
      <Link href="/habits" className="btn btn-primary">Back to Habits</Link>
    </div>
  );

  const logs = habitLogs.filter(l => l.habit_id === id);
  const streak = calculateStreak(logs);
  const today = new Date().toISOString().split('T')[0];
  const todayLog = logs.find(l => l.log_date === today);
  const isDone = todayLog?.status === 'completed';

  const lastThirtyDays = useMemo(() => {
    const result = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = logs.find(l => l.log_date === dateStr);
      result.push({ date: dateStr, log, dayName: d.toLocaleDateString('en-US', { weekday: 'short' }), day: d.getDate() });
    }
    return result;
  }, [logs]);

  const handleDelete = () => {
    if (window.confirm(`Delete "${habit.title}"? All logs will be lost.`)) {
      deleteHabit(id);
      toast.success('Habit deleted');
      router.push('/habits');
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <Link href="/habits" className="btn btn-ghost" style={{ gap: 8 }}>
          <ArrowLeft size={16} /> Habits
        </Link>
        <button onClick={handleDelete} className="btn btn-danger btn-sm" style={{ gap: 6 }}>
          <Trash2 size={14} /> Delete Habit
        </button>
      </div>

      {/* Header */}
      <div className="glass" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 48 }}>{habit.icon || '📌'}</div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{habit.title}</h1>
            {habit.description && <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{habit.description}</p>}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '3px 10px', borderRadius: 4 }}>
                {habit.frequency}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '3px 10px', borderRadius: 4 }}>
                Target: {habit.target_value} {habit.unit}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '3px 10px', borderRadius: 4 }}>
                Since {formatDate(habit.start_date)}
              </span>
            </div>
          </div>
        </div>

        {/* Today's action */}
        <div style={{
          background: isDone ? 'rgba(16,185,129,0.08)' : 'var(--bg-tertiary)',
          border: `1px solid ${isDone ? 'rgba(16,185,129,0.25)' : 'var(--border)'}`,
          borderRadius: 12, padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Today</div>
            <div style={{ fontSize: 13, color: isDone ? 'var(--emerald)' : 'var(--text-muted)' }}>
              {isDone ? '✓ Completed!' : todayLog?.status === 'skipped' ? 'Skipped' : 'Not logged yet'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!isDone && (
              <button onClick={() => { logHabit(id, today, 'completed'); toast.success('✅ Habit logged!'); }} className="btn btn-primary btn-sm">
                Mark Complete
              </button>
            )}
            {isDone && (
              <button onClick={() => { logHabit(id, today, 'missed'); toast.success('Unmarked'); }} className="btn btn-ghost btn-sm">
                Undo
              </button>
            )}
            {!todayLog && (
              <button onClick={() => { logHabit(id, today, 'skipped'); toast.success('Skipped'); }} className="btn btn-ghost btn-sm">
                Skip
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="card-grid card-grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Current Streak', value: `${streak.currentStreak}`, icon: '🔥', color: 'var(--amber)' },
          { label: 'Best Streak', value: `${streak.longestStreak}`, icon: '🏆', color: 'var(--accent-light)' },
          { label: 'Total Done', value: `${streak.totalCompletions}`, icon: '✓', color: 'var(--emerald)' },
          { label: 'Completion Rate', value: `${Math.round(streak.completionRate)}%`, icon: '📊', color: 'var(--indigo)' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="glass" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 28 }}>{icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color, marginTop: 4 }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Contribution History</h3>
        <HeatMap logs={logs} />
      </div>

      {/* Last 30 days calendar */}
      <div className="glass" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Last 30 Days</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>{d}</div>
          ))}
          {/* Filler for alignment */}
          {Array.from({ length: new Date(lastThirtyDays[0]?.date || today).getDay() === 0 ? 6 : (new Date(lastThirtyDays[0]?.date || today).getDay() - 1) }).map((_, i) => (
            <div key={`filler-${i}`} />
          ))}
          {lastThirtyDays.map(({ date, log, day }) => {
            const statusColors = { completed: 'var(--emerald)', skipped: 'var(--amber)', missed: 'var(--rose)' };
            const bg = log ? statusColors[log.status] : 'var(--bg-tertiary)';
            return (
              <button key={date}
                onClick={() => { if (date <= today) logHabit(id, date, log?.status === 'completed' ? 'missed' : 'completed'); }}
                style={{
                  aspectRatio: '1', borderRadius: 8, border: `1px solid ${date === today ? 'var(--accent)' : 'var(--border)'}`,
                  background: `${bg}20`, color: log ? bg : 'var(--text-muted)',
                  fontSize: 12, fontWeight: 600, cursor: date <= today ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all var(--transition)',
                }}
                title={`${date}: ${log?.status || 'not logged'}`}
              >
                {log?.status === 'completed' ? '✓' : day}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
          {[
            { color: 'var(--emerald)', label: 'Completed' },
            { color: 'var(--amber)', label: 'Skipped' },
            { color: 'var(--rose)', label: 'Missed' },
            { color: 'var(--bg-tertiary)', label: 'Not logged' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: `${color}40`, border: `1px solid ${color}` }} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
