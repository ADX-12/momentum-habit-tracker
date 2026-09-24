'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import { Target, CheckCircle2, Clock, TrendingUp, Flame, ArrowRight, Plus, AlertTriangle, Star, Calendar } from 'lucide-react';
import { useAppStore } from '@/store';
import { getGreeting, getDaysRemainingWithStart, getGoalHealth, calculateStreak, formatDate } from '@/lib/date';
import { cn } from '@/utils/cn';
import { PRIORITY_COLORS } from '@/utils/constants';

// Circular progress component
function CircularProgress({ value, size = 80, strokeWidth = 8, color = '#7c3aed' }: {
  value: number; size?: number; strokeWidth?: number; color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size} aria-label={`Progress: ${value}%`}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--bg-tertiary)" strokeWidth={strokeWidth} />
      <circle
        cx={size/2} cy={size/2} r={radius} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dy=".3em" fill="var(--text-primary)" fontSize={size/5} fontWeight={700}>
        {Math.round(value)}%
      </text>
    </svg>
  );
}

// Progress bar
function ProgressBar({ value, color = 'var(--accent)', height = 6 }: { value: number; color?: string; height?: number }) {
  return (
    <div style={{ background: 'var(--bg-tertiary)', borderRadius: 999, height, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${Math.min(100, value)}%`,
        background: color, borderRadius: 999,
        transition: 'width 0.8s ease',
      }} />
    </div>
  );
}

// KPI Card
function KPICard({ title, value, subtitle, icon, color, href }: {
  title: string; value: string | number; subtitle?: string;
  icon: React.ReactNode; color: string; href?: string;
}) {
  const content = (
    <div className="glass" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color,
        }}>{icon}</div>
        {href && <ArrowRight size={14} color="var(--text-muted)" />}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{subtitle}</div>}
    </div>
  );
  if (href) return <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link>;
  return content;
}

export default function DashboardPage() {
  const { goals, habits, habitLogs, tasks, notifications, user } = useAppStore();
  const today = new Date().toISOString().split('T')[0];

  const todayHabits = useMemo(() => {
    return habits.filter(h => h.is_active);
  }, [habits]);

  const todayLogs = useMemo(() => {
    return habitLogs.filter(l => l.log_date === today);
  }, [habitLogs, today]);

  const completedHabitsToday = todayLogs.filter(l => l.status === 'completed').length;
  const totalHabitsToday = todayHabits.length;
  const habitCompletionPct = totalHabitsToday > 0 ? (completedHabitsToday / totalHabitsToday) * 100 : 0;

  const todayTasks = tasks.filter(t => t.due_date === today || t.status === 'in_progress');
  const completedTasksToday = tasks.filter(t => t.status === 'completed').length;
  const activeTasks = tasks.filter(t => t.status !== 'completed');

  const activeGoals = goals.filter(g => g.status === 'active');
  const upcomingDeadlines = useMemo(() => {
    return [...goals, ...tasks]
      .filter((item): item is typeof goals[0] => 'target_date' in item && item.status === 'active')
      .map(g => ({
        ...g,
        daysInfo: getDaysRemainingWithStart(g.start_date, g.target_date),
      }))
      .filter(g => g.daysInfo.days >= 0 && g.daysInfo.days <= 30)
      .sort((a, b) => a.daysInfo.days - b.daysInfo.days)
      .slice(0, 5);
  }, [goals, tasks]);

  // Today's overall progress
  const totalToday = totalHabitsToday + activeTasks.length;
  const doneToday = completedHabitsToday + (activeTasks.length - activeTasks.filter(t => t.status !== 'completed').length);
  const overallPct = totalToday > 0 ? (doneToday / totalToday) * 100 : 0;

  // Best streak across all habits
  const bestStreak = useMemo(() => {
    return habits.reduce((max, habit) => {
      const logs = habitLogs.filter(l => l.habit_id === habit.id);
      const streak = calculateStreak(logs).currentStreak;
      return Math.max(max, streak);
    }, 0);
  }, [habits, habitLogs]);

  const unreadNotifs = notifications.filter(n => !n.is_read).length;

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          {getGreeting()}, {user.full_name} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Here's your productivity snapshot for today
        </p>
      </div>

      {/* KPI Row */}
      <div className="card-grid card-grid-4" style={{ marginBottom: 24 }}>
        <KPICard
          title="Habits Today"
          value={`${completedHabitsToday}/${totalHabitsToday}`}
          subtitle={`${Math.round(habitCompletionPct)}% complete`}
          icon={<CheckCircle2 size={20} />}
          color="var(--emerald)"
          href="/habits"
        />
        <KPICard
          title="Active Goals"
          value={activeGoals.length}
          subtitle={`${goals.filter(g => g.status === 'completed').length} completed`}
          icon={<Target size={20} />}
          color="var(--accent-light)"
          href="/goals"
        />
        <KPICard
          title="Current Streak"
          value={`${bestStreak} 🔥`}
          subtitle="days in a row"
          icon={<Flame size={20} />}
          color="var(--amber)"
        />
        <KPICard
          title="Tasks Pending"
          value={activeTasks.filter(t => t.status !== 'completed').length}
          subtitle={`${completedTasksToday} completed`}
          icon={<Clock size={20} />}
          color="var(--rose)"
          href="/tasks"
        />
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Today's Habits */}
          <div className="glass" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Today's Habits</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                  {completedHabitsToday} of {totalHabitsToday} completed
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CircularProgress value={habitCompletionPct} size={52} strokeWidth={6} />
                <Link href="/habits" className="btn btn-ghost btn-sm" style={{ gap: 4 }}>
                  All <ArrowRight size={12} />
                </Link>
              </div>
            </div>
            <ProgressBar value={habitCompletionPct} color="var(--emerald)" height={4} />
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {todayHabits.slice(0, 6).map(habit => {
                const log = todayLogs.find(l => l.habit_id === habit.id);
                const isDone = log?.status === 'completed';
                const isSkipped = log?.status === 'skipped';
                return (
                  <HabitRow key={habit.id} habit={habit} isDone={isDone} isSkipped={isSkipped} date={today} />
                );
              })}
            </div>
            {todayHabits.length === 0 && (
              <EmptyState icon="✓" title="No habits yet" desc="Create your first habit to start tracking" href="/habits" />
            )}
          </div>

          {/* Active Goals */}
          <div className="glass" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Active Goals</h2>
              <Link href="/goals" className="btn btn-ghost btn-sm" style={{ gap: 4 }}>
                All <ArrowRight size={12} />
              </Link>
            </div>
            {activeGoals.length === 0 ? (
              <EmptyState icon="🎯" title="No goals yet" desc="Set your first goal to start your journey" href="/goals/new" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {activeGoals.slice(0, 4).map(goal => {
                  const progress = goal.target_value > 0 ? (goal.current_value / goal.target_value) * 100 : 0;
                  const health = getGoalHealth(goal.start_date, goal.target_date, goal.current_value, goal.target_value);
                  const daysInfo = getDaysRemainingWithStart(goal.start_date, goal.target_date);
                  const healthColors = { on_track: 'var(--emerald)', needs_attention: 'var(--amber)', behind: 'var(--rose)' };
                  return (
                    <Link key={goal.id} href={`/goals/${goal.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        padding: '14px 16px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 10,
                        border: '1px solid var(--border)',
                        transition: 'all var(--transition)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{goal.title}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                              {goal.unit ? `${goal.current_value.toLocaleString()} / ${goal.target_value.toLocaleString()} ${goal.unit}` : `${Math.round(progress)}% done`}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, color: healthColors[health.status], fontWeight: 600, textTransform: 'capitalize' }}>
                              {health.status.replace('_', ' ')}
                            </div>
                            <div style={{ fontSize: 11, color: daysInfo.status === 'overdue' ? 'var(--rose)' : 'var(--text-muted)', marginTop: 2 }}>
                              {daysInfo.label}
                            </div>
                          </div>
                        </div>
                        <ProgressBar value={progress} color={healthColors[health.status]} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                          <span>{Math.round(progress)}% complete</span>
                          <span>{Math.round(100 - daysInfo.percentTimeElapsed)}% time left</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Today's Tasks */}
          <div className="glass" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Today's Tasks</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link href="/tasks" className="btn btn-secondary btn-sm" style={{ gap: 4 }}>
                  <Plus size={12} /> Add Task
                </Link>
              </div>
            </div>
            {activeTasks.slice(0, 5).map(task => (
              <TaskRow key={task.id} task={task} />
            ))}
            {activeTasks.length === 0 && (
              <EmptyState icon="✅" title="All clear!" desc="No pending tasks. Great job!" href="/tasks" />
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Overall Today Progress */}
          <div className="glass" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ marginBottom: 16 }}>
              <CircularProgress value={overallPct} size={100} strokeWidth={10} color="var(--accent)" />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Today's Progress</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              {completedHabitsToday + (activeTasks.length - activeTasks.filter(t => t.status !== 'completed').length)} / {totalToday} done
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-around', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--emerald)' }}>{completedHabitsToday}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Habits</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--amber)' }}>{completedTasksToday}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tasks</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--rose)' }}>{unreadNotifs}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Alerts</div>
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="glass" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Upcoming Deadlines</h2>
              <AlertTriangle size={15} color="var(--amber)" />
            </div>
            {upcomingDeadlines.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                🎉 No upcoming deadlines
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcomingDeadlines.map((item, i) => {
                  const urgency = item.daysInfo.days <= 3 ? 'var(--rose)' :
                    item.daysInfo.days <= 7 ? 'var(--amber)' : 'var(--text-secondary)';
                  return (
                    <div key={item.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 0',
                      borderBottom: i < upcomingDeadlines.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%', background: urgency, flexShrink: 0,
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: 11, color: urgency, fontWeight: 500, marginTop: 2 }}>
                          {item.daysInfo.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Streak Widget */}
          <StreakWidget habits={habits} habitLogs={habitLogs} />

          {/* Quick Links */}
          <div className="glass" style={{ padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { href: '/goals/new', label: '+ Create Goal', color: 'var(--accent-light)' },
                { href: '/habits', label: '+ Add Habit', color: 'var(--emerald)' },
                { href: '/tasks', label: '+ Add Task', color: 'var(--amber)' },
                { href: '/reviews', label: '📝 Daily Review', color: 'var(--indigo)' },
              ].map(({ href, label, color }) => (
                <Link key={href} href={href} style={{
                  display: 'block', padding: '8px 12px', borderRadius: 8,
                  background: 'var(--bg-tertiary)', color, fontSize: 13, fontWeight: 600,
                  textDecoration: 'none', transition: 'all var(--transition)',
                  border: '1px solid var(--border)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function HabitRow({ habit, isDone, isSkipped, date }: { habit: any; isDone: boolean; isSkipped: boolean; date: string }) {
  const { logHabit } = useAppStore();

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 12px', borderRadius: 8,
      background: isDone ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-tertiary)',
      border: `1px solid ${isDone ? 'rgba(16, 185, 129, 0.2)' : 'var(--border)'}`,
      transition: 'all var(--transition)',
    }}>
      <button
        onClick={() => logHabit(habit.id, date, isDone ? 'missed' : 'completed')}
        style={{
          width: 22, height: 22, borderRadius: 6, border: `2px solid ${isDone ? 'var(--emerald)' : 'var(--border)'}`,
          background: isDone ? 'var(--emerald)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all var(--transition)', flexShrink: 0,
          color: 'white', fontSize: 12,
        }}
        aria-label={`Mark ${habit.title} as ${isDone ? 'incomplete' : 'complete'}`}
      >
        {isDone && '✓'}
      </button>
      <span style={{ fontSize: 18 }}>{habit.icon || '📌'}</span>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 13, fontWeight: 500,
          color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
          textDecoration: isDone ? 'line-through' : 'none',
        }}>
          {habit.title}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {habit.target_value} {habit.unit} · {habit.frequency}
        </div>
      </div>
      {isSkipped && (
        <span style={{ fontSize: 10, color: 'var(--amber)', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
          SKIPPED
        </span>
      )}
      {!isDone && !isSkipped && (
        <button
          onClick={() => logHabit(habit.id, date, 'skipped')}
          style={{ fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}
        >
          Skip
        </button>
      )}
    </div>
  );
}

function TaskRow({ task }: { task: any }) {
  const { completeTask } = useAppStore();
  const isDone = task.status === 'completed';
  const priorityColorMap: Record<string, string> = { low: 'var(--emerald)', medium: 'var(--amber)', high: '#f97316', critical: 'var(--rose)' };
  const priorityColor = priorityColorMap[task.priority as string] || 'var(--text-muted)';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ width: 4, height: 30, borderRadius: 2, background: priorityColor, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 500,
          color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
          textDecoration: isDone ? 'line-through' : 'none',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {task.title}
        </div>
        {task.due_date && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            Due {task.due_date}
          </div>
        )}
      </div>
      <span style={{
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
        color: task.status === 'in_progress' ? 'var(--indigo)' : task.status === 'overdue' ? 'var(--rose)' : 'var(--text-muted)',
        padding: '2px 8px', borderRadius: 4,
        background: task.status === 'in_progress' ? 'rgba(99,102,241,0.1)' : task.status === 'overdue' ? 'rgba(244,63,94,0.1)' : 'var(--bg-tertiary)',
      }}>
        {task.status.replace('_', ' ')}
      </span>
      {!isDone && (
        <button
          onClick={() => completeTask(task.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          aria-label="Complete task"
        >
          <CheckCircle2 size={16} />
        </button>
      )}
    </div>
  );
}

function StreakWidget({ habits, habitLogs }: { habits: any[]; habitLogs: any[] }) {
  const topHabitStreak = useMemo(() => {
    let best = { habit: null as any, streak: 0, longest: 0 };
    habits.forEach(habit => {
      const logs = habitLogs.filter(l => l.habit_id === habit.id);
      const data = calculateStreak(logs);
      if (data.currentStreak > best.streak) {
        best = { habit, streak: data.currentStreak, longest: data.longestStreak };
      }
    });
    return best;
  }, [habits, habitLogs]);

  return (
    <div className="glass" style={{ padding: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Streak Leader
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 36 }}>{topHabitStreak.habit?.icon || '🔥'}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{topHabitStreak.habit?.title || 'No habits'}</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--amber)' }}>{topHabitStreak.streak} 🔥</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Current</div>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-light)' }}>{topHabitStreak.longest} 🏆</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Best</div>
            </div>
          </div>
        </div>
      </div>
      <Link href="/habits" style={{ display: 'block', marginTop: 12, fontSize: 12, color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 600 }}>
        View all streaks →
      </Link>
    </div>
  );
}

function EmptyState({ icon, title, desc, href }: { icon: string; title: string; desc: string; href: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{desc}</div>
      <Link href={href} className="btn btn-primary btn-sm">Get started</Link>
    </div>
  );
}
