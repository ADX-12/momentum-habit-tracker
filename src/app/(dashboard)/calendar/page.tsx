'use client';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Target, CheckCircle2, ClipboardList } from 'lucide-react';
import { useAppStore } from '@/store';
import Link from 'next/link';

type ViewMode = 'month' | 'week' | 'day';

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Mon-start
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
}

export default function CalendarPage() {
  const [view, setView] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const { goals, habits, tasks, habitLogs } = useAppStore();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const calendarDays = getCalendarDays(year, month);

  const getDateStr = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getItemsForDate = (dateStr: string) => {
    const items: { type: string; label: string; color: string; href: string }[] = [];

    // Goals with that target date
    goals.filter(g => g.target_date === dateStr).forEach(g => {
      items.push({ type: 'goal', label: g.title, color: 'var(--accent-light)', href: `/goals/${g.id}` });
    });

    // Tasks due that day
    tasks.filter(t => t.due_date === dateStr && t.status !== 'completed').forEach(t => {
      const pColors: Record<string, string> = { low: 'var(--emerald)', medium: 'var(--amber)', high: '#f97316', critical: 'var(--rose)' };
      items.push({ type: 'task', label: t.title, color: pColors[t.priority] || 'var(--text-muted)', href: '/tasks' });
    });

    // Habits that have a log for that date
    const dayLogs = habitLogs.filter(l => l.log_date === dateStr);
    dayLogs.forEach(log => {
      const habit = habits.find(h => h.id === log.habit_id);
      if (habit) {
        const color = log.status === 'completed' ? 'var(--emerald)' : log.status === 'skipped' ? 'var(--amber)' : 'var(--rose)';
        items.push({ type: 'habit', label: `${habit.icon || '📌'} ${habit.title}`, color, href: `/habits/${habit.id}` });
      }
    });

    return items;
  };

  const navigate = (dir: number) => {
    setCurrentDate(d => {
      const newD = new Date(d);
      newD.setMonth(newD.getMonth() + dir);
      return newD;
    });
  };

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Calendar</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Your schedule at a glance</p>
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-tertiary)', borderRadius: 10, padding: 4 }}>
          {(['month', 'week', 'day'] as ViewMode[]).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '6px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: view === v ? 'var(--bg-card)' : 'transparent',
              color: view === v ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
              transition: 'all var(--transition)',
            }}>{v}</button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-icon"><ChevronLeft size={18} /></button>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', flex: 1, textAlign: 'center' }}>
          {monthNames[month]} {year}
        </h2>
        <button onClick={() => navigate(1)} className="btn btn-ghost btn-icon"><ChevronRight size={18} /></button>
        <button onClick={() => setCurrentDate(new Date())} className="btn btn-secondary btn-sm">Today</button>
      </div>

      {/* Month view */}
      {view === 'month' && (
        <div className="glass" style={{ overflow: 'hidden' }}>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
            {dayNames.map(d => (
              <div key={d} style={{ padding: '10px 0', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} style={{ minHeight: 110, borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-tertiary)' }} />;

              const dateStr = getDateStr(day);
              const isToday = dateStr === todayStr;
              const items = getItemsForDate(dateStr);
              const habitLogsForDay = habitLogs.filter(l => l.log_date === dateStr);
              const completedHabits = habitLogsForDay.filter(l => l.status === 'completed').length;

              return (
                <div key={day} style={{
                  minHeight: 110, padding: 8,
                  borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
                  background: isToday ? 'var(--accent-glow)' : 'transparent',
                  transition: 'background var(--transition)',
                  cursor: 'default',
                }}
                onMouseEnter={e => !isToday && (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                onMouseLeave={e => !isToday && (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: isToday ? 'var(--accent)' : 'transparent',
                      color: isToday ? 'white' : 'var(--text-primary)',
                      fontSize: 13, fontWeight: isToday ? 700 : 500,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{day}</span>
                    {completedHabits > 0 && (
                      <span style={{ fontSize: 10, color: 'var(--emerald)', fontWeight: 700 }}>
                        {completedHabits}✓
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {items.slice(0, 3).map((item, j) => (
                      <Link key={j} href={item.href} style={{
                        display: 'block', fontSize: 10, fontWeight: 600,
                        color: item.color, background: `${item.color}15`,
                        padding: '2px 5px', borderRadius: 3, textDecoration: 'none',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {item.label}
                      </Link>
                    ))}
                    {items.length > 3 && (
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', paddingLeft: 5 }}>+{items.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week view */}
      {view === 'week' && (
        <WeekView currentDate={currentDate} goals={goals} tasks={tasks} habits={habits} habitLogs={habitLogs} />
      )}

      {/* Day view */}
      {view === 'day' && (
        <DayView currentDate={currentDate} goals={goals} tasks={tasks} habits={habits} habitLogs={habitLogs} />
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 16, fontSize: 12, flexWrap: 'wrap' }}>
        {[
          { color: 'var(--accent-light)', label: 'Goal deadline' },
          { color: 'var(--amber)', label: 'Task due' },
          { color: 'var(--emerald)', label: 'Habit completed' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: `${color}40`, border: `1px solid ${color}` }} />
            <span style={{ color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeekView({ currentDate, goals, tasks, habits, habitLogs }: any) {
  const startOfWeek = new Date(currentDate);
  const day = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - (day === 0 ? 6 : day - 1));

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="glass" style={{ overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {days.map(d => {
          const dateStr = d.toISOString().split('T')[0];
          const isToday = dateStr === todayStr;
          const dayTasks = tasks.filter((t: any) => t.due_date === dateStr);
          const dayGoals = goals.filter((g: any) => g.target_date === dateStr);
          const dayLogs = habitLogs.filter((l: any) => l.log_date === dateStr);

          return (
            <div key={dateStr} style={{
              padding: 12, borderRight: '1px solid var(--border)',
              background: isToday ? 'var(--accent-glow)' : 'transparent',
              minHeight: 200,
            }}>
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  {d.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', margin: '4px auto',
                  background: isToday ? 'var(--accent)' : 'transparent',
                  color: isToday ? 'white' : 'var(--text-primary)',
                  fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {d.getDate()}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {dayGoals.map((g: any) => (
                  <Link key={g.id} href={`/goals/${g.id}`} style={{ fontSize: 11, color: 'var(--accent-light)', background: 'var(--accent-glow)', padding: '3px 6px', borderRadius: 4, textDecoration: 'none', fontWeight: 600, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    🎯 {g.title}
                  </Link>
                ))}
                {dayTasks.map((t: any) => (
                  <div key={t.id} style={{ fontSize: 11, color: t.priority === 'critical' ? 'var(--rose)' : 'var(--amber)', background: `${t.priority === 'critical' ? 'var(--rose)' : 'var(--amber)'}15`, padding: '3px 6px', borderRadius: 4, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    📋 {t.title}
                  </div>
                ))}
                {dayLogs.filter((l: any) => l.status === 'completed').length > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--emerald)', background: 'rgba(16,185,129,0.1)', padding: '3px 6px', borderRadius: 4, fontWeight: 600 }}>
                    ✓ {dayLogs.filter((l: any) => l.status === 'completed').length} habits done
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DayView({ currentDate, goals, tasks, habits, habitLogs }: any) {
  const dateStr = currentDate.toISOString().split('T')[0];
  const dayTasks = tasks.filter((t: any) => t.due_date === dateStr);
  const dayGoals = goals.filter((g: any) => g.target_date === dateStr);
  const dayLogs = habitLogs.filter((l: any) => l.log_date === dateStr);

  return (
    <div className="glass" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
        {currentDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </h3>
      {dayGoals.length + dayTasks.length + dayLogs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 14 }}>
          Nothing scheduled for this day 🎉
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {dayGoals.map((g: any) => (
            <Link key={g.id} href={`/goals/${g.id}`} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              background: 'var(--accent-glow)', borderRadius: 8, textDecoration: 'none',
              border: '1px solid rgba(124,58,237,0.2)',
            }}>
              <Target size={16} color="var(--accent-light)" />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Goal deadline: {g.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Target date</div>
              </div>
            </Link>
          ))}
          {dayTasks.map((t: any) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <ClipboardList size={16} color="var(--amber)" />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{t.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{t.priority} priority task{t.due_time ? ` at ${t.due_time}` : ''}</div>
              </div>
            </div>
          ))}
          {dayLogs.map((log: any) => {
            const habit = habits.find((h: any) => h.id === log.habit_id);
            if (!habit) return null;
            const color = log.status === 'completed' ? 'var(--emerald)' : 'var(--amber)';
            return (
              <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: `${color}10`, borderRadius: 8, border: `1px solid ${color}30` }}>
                <CheckCircle2 size={16} color={color} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{habit.icon} {habit.title}</div>
                  <div style={{ fontSize: 11, color, textTransform: 'capitalize', fontWeight: 600 }}>{log.status}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
