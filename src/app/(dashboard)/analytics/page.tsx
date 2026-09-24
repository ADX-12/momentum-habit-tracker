'use client';
import { useMemo } from 'react';
import { useAppStore } from '@/store';
import { calculateStreak, getGoalHealth } from '@/lib/date';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';

const COLORS = ['#7c3aed', '#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#14b8a6'];

function KPICard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="glass" style={{ padding: 20 }}>
      <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color || 'var(--text-primary)', fontWeight: 600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { goals, habits, habitLogs, tasks, milestones } = useAppStore();

  const today = new Date().toISOString().split('T')[0];

  // --- KPIs ---
  const kpis = useMemo(() => {
    const activeGoals = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');
    const avgCompletion = activeGoals.length > 0
      ? activeGoals.reduce((sum, g) => sum + (g.target_value > 0 ? (g.current_value / g.target_value) * 100 : 0), 0) / activeGoals.length
      : 0;

    const bestStreak = habits.reduce((max, habit) => {
      const logs = habitLogs.filter(l => l.habit_id === habit.id);
      return Math.max(max, calculateStreak(logs).currentStreak);
    }, 0);
    const longestStreak = habits.reduce((max, habit) => {
      const logs = habitLogs.filter(l => l.habit_id === habit.id);
      return Math.max(max, calculateStreak(logs).longestStreak);
    }, 0);

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const overdueTasks = tasks.filter(t => t.status !== 'completed' && t.due_date && t.due_date < today).length;

    const completedMilestones = milestones.filter(m => m.status === 'completed').length;

    return { activeGoals: activeGoals.length, completedGoals: completedGoals.length, avgCompletion, bestStreak, longestStreak, completedTasks, overdueTasks, completedMilestones };
  }, [goals, habits, habitLogs, tasks, milestones, today]);

  // --- Habit completion last 14 days ---
  const habitCompletionData = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLogs = habitLogs.filter(l => l.log_date === dateStr);
      const completed = dayLogs.filter(l => l.status === 'completed').length;
      const total = habits.filter(h => h.is_active).length;
      days.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed,
        total,
        pct: total > 0 ? Math.round((completed / total) * 100) : 0,
      });
    }
    return days;
  }, [habits, habitLogs]);

  // --- Goal progress ---
  const goalProgressData = useMemo(() =>
    goals.filter(g => g.status === 'active').map(g => ({
      name: g.title.length > 20 ? g.title.substring(0, 20) + '...' : g.title,
      progress: g.target_value > 0 ? Math.round((g.current_value / g.target_value) * 100) : 0,
      health: getGoalHealth(g.start_date, g.target_date, g.current_value, g.target_value).status,
    })), [goals]);

  // --- Task status donut ---
  const taskStatusData = useMemo(() => [
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#10b981' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#6366f1' },
    { name: 'Todo', value: tasks.filter(t => t.status === 'todo').length, color: '#94a3b8' },
    { name: 'Overdue', value: tasks.filter(t => t.status !== 'completed' && t.due_date && t.due_date < today).length, color: '#f43f5e' },
  ].filter(d => d.value > 0), [tasks, today]);

  // --- Streak data per habit ---
  const streakData = useMemo(() =>
    habits.map(habit => {
      const logs = habitLogs.filter(l => l.habit_id === habit.id);
      const streak = calculateStreak(logs);
      return {
        name: `${habit.icon} ${habit.title.length > 15 ? habit.title.substring(0, 15) + '...' : habit.title}`,
        current: streak.currentStreak,
        best: streak.longestStreak,
        rate: Math.round(streak.completionRate),
      };
    }).sort((a, b) => b.current - a.current), [habits, habitLogs]);

  // --- Weekly habit pct (last 8 weeks) ---
  const weeklyData = useMemo(() => {
    const weeks = [];
    for (let w = 7; w >= 0; w--) {
      const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - w * 7 - weekStart.getDay() + 1);
      const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6);
      const weekLogs = habitLogs.filter(l => {
        const d = new Date(l.log_date);
        return d >= weekStart && d <= weekEnd;
      });
      const completed = weekLogs.filter(l => l.status === 'completed').length;
      const total = weekLogs.length;
      weeks.push({
        week: `W${8-w}`,
        completion: total > 0 ? Math.round((completed / total) * 100) : 0,
        completed,
      });
    }
    return weeks;
  }, [habitLogs]);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Analytics</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Your productivity and progress at a glance</p>
      </div>

      {/* KPI Row */}
      <div className="card-grid card-grid-4" style={{ marginBottom: 28 }}>
        <KPICard label="Active Goals" value={kpis.activeGoals} sub={`${kpis.completedGoals} completed`} color="var(--accent-light)" />
        <KPICard label="Avg Goal Progress" value={`${Math.round(kpis.avgCompletion)}%`} sub="across active goals" color="var(--indigo)" />
        <KPICard label="Best Streak" value={`${kpis.bestStreak} 🔥`} sub={`${kpis.longestStreak} longest ever`} color="var(--amber)" />
        <KPICard label="Milestones Done" value={kpis.completedMilestones} sub={`${milestones.length} total`} color="var(--emerald)" />
      </div>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Habit completion area chart */}
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>
            Daily Habit Completion (14 days)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={habitCompletionData}>
              <defs>
                <linearGradient id="habitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} domain={[0, 100]} unit="%" />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="pct" stroke="#7c3aed" fill="url(#habitGrad)" strokeWidth={2} name="Completion %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Task status donut */}
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>Task Status</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val, name) => [val, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {taskStatusData.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{d.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Goal progress bars */}
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>Goal Progress</h3>
          {goalProgressData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 14 }}>No active goals</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={goalProgressData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} unit="%" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} width={100} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="progress" radius={4} name="Progress %">
                  {goalProgressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.health === 'on_track' ? '#10b981' : entry.health === 'needs_attention' ? '#f59e0b' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Weekly habit trend */}
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>Weekly Habit Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} domain={[0, 100]} unit="%" />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="completion" fill="#6366f1" radius={4} name="Completion %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Streak leaderboard */}
      <div className="glass" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>
          Habit Streak Leaderboard
        </h3>
        {streakData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 14 }}>No habits yet</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {streakData.map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: i < streakData.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? 'linear-gradient(135deg, #f59e0b, #f97316)' : i === 1 ? 'linear-gradient(135deg, #94a3b8, #64748b)' : i === 2 ? 'linear-gradient(135deg, #b45309, #92400e)' : 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: i < 3 ? 'white' : 'var(--text-muted)', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{h.name}</div>
                  <div style={{ background: 'var(--bg-tertiary)', borderRadius: 999, height: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${h.rate}%`, background: i === 0 ? 'var(--amber)' : 'var(--accent)', borderRadius: 999 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, textAlign: 'center', flexShrink: 0 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--amber)' }}>{h.current}🔥</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Current</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent-light)' }}>{h.best}🏆</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Best</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--emerald)' }}>{h.rate}%</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Rate</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
