'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Target, CheckCircle2, ClipboardList, Calendar, Milestone } from 'lucide-react';
import { useAppStore } from '@/store';
import { getDaysRemainingWithStart, formatDate } from '@/lib/date';

type TimelineItem = {
  id: string;
  type: 'goal' | 'habit' | 'task' | 'milestone';
  title: string;
  date: string;
  status: string;
  description?: string;
  href: string;
  icon?: string;
  priority?: string;
};

const TYPE_CONFIG = {
  goal: { color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', label: 'Goal', icon: '🎯' },
  task: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Task', icon: '📋' },
  milestone: { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', label: 'Milestone', icon: '🏁' },
  habit: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Habit', icon: '✓' },
};

export default function TimelinePage() {
  const { goals, tasks, habits, milestones } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'goal' | 'task' | 'milestone'>('all');
  const [view, setView] = useState<'upcoming' | 'all'>('upcoming');

  const today = new Date().toISOString().split('T')[0];

  const allItems: TimelineItem[] = useMemo(() => {
    const items: TimelineItem[] = [];

    goals.filter(g => g.status === 'active').forEach(g => {
      items.push({
        id: g.id, type: 'goal', title: g.title, date: g.target_date,
        status: g.status, description: g.description, href: `/goals/${g.id}`, priority: g.priority,
      });
    });

    tasks.filter(t => t.due_date && t.status !== 'completed').forEach(t => {
      items.push({
        id: t.id, type: 'task', title: t.title, date: t.due_date!,
        status: t.status, description: t.description, href: '/tasks', priority: t.priority,
      });
    });

    milestones.filter(m => m.target_date && m.status !== 'completed').forEach(m => {
      const goal = goals.find(g => g.id === m.goal_id);
      items.push({
        id: m.id, type: 'milestone', title: m.title, date: m.target_date!,
        status: m.status, description: goal ? `Goal: ${goal.title}` : undefined,
        href: m.goal_id ? `/goals/${m.goal_id}` : '/goals',
      });
    });

    return items
      .filter(i => view === 'all' || i.date >= today)
      .filter(i => filter === 'all' || i.type === filter)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [goals, tasks, milestones, filter, view, today]);

  // Group by month
  const grouped = useMemo(() => {
    const groups: Record<string, TimelineItem[]> = {};
    allItems.forEach(item => {
      const monthKey = item.date.substring(0, 7); // YYYY-MM
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(item);
    });
    return groups;
  }, [allItems]);

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const getMonthLabel = (key: string) => {
    const [y, m] = key.split('-');
    return `${monthNames[parseInt(m) - 1]} ${y}`;
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Timeline</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Your goals, milestones, and tasks on a visual timeline</p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-tertiary)', borderRadius: 10, padding: 4 }}>
          {(['upcoming', 'all'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '6px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: view === v ? 'var(--bg-card)' : 'transparent',
              color: view === v ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
              transition: 'all var(--transition)',
            }}>{v === 'upcoming' ? 'Upcoming' : 'All'}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['all', 'goal', 'task', 'milestone'] as const).map(f => {
            const config = f === 'all' ? { color: 'var(--text-secondary)', bg: 'var(--bg-tertiary)', label: 'All' } : TYPE_CONFIG[f];
            return (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '6px 14px', borderRadius: 999, border: `1px solid ${filter === f ? config.color : 'var(--border)'}`,
                background: filter === f ? config.bg : 'transparent',
                color: filter === f ? config.color : 'var(--text-muted)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                transition: 'all var(--transition)',
              }}>{config.label}</button>
            );
          })}
        </div>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="glass" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🗓</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>Nothing on the timeline</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
            Add goals with target dates to see them here
          </div>
          <Link href="/goals/new" className="btn btn-primary">Create Goal</Link>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Central line */}
          <div style={{
            position: 'absolute', left: 24, top: 0, bottom: 0, width: 2,
            background: 'linear-gradient(to bottom, var(--accent), rgba(124,58,237,0.1))',
          }} />

          <div style={{ paddingLeft: 60 }}>
            {Object.entries(grouped).map(([monthKey, items]) => (
              <div key={monthKey} style={{ marginBottom: 40 }}>
                {/* Month marker */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 20, marginLeft: -48 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent), var(--indigo))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em',
                    flexShrink: 0, boxShadow: '0 4px 12px var(--accent-glow)',
                  }}>
                    {monthNames[parseInt(monthKey.split('-')[1]) - 1].substring(0, 3).toUpperCase()}
                  </div>
                  <div style={{ marginLeft: 16, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {getMonthLabel(monthKey)}
                  </div>
                </div>

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {items.map(item => {
                    const config = TYPE_CONFIG[item.type];
                    const daysInfo = getDaysRemainingWithStart(item.date, item.date);
                    const daysDiff = (() => {
                      const t = new Date(today);
                      const d = new Date(item.date);
                      return Math.round((d.getTime() - t.getTime()) / (1000 * 60 * 60 * 24));
                    })();
                    const isOverdue = daysDiff < 0;
                    const isToday = item.date === today;
                    const isSoon = daysDiff >= 0 && daysDiff <= 7;

                    return (
                      <div key={item.id} style={{ position: 'relative', marginLeft: -36 }}>
                        {/* Node */}
                        <div style={{
                          position: 'absolute', left: 0, top: 12,
                          width: 24, height: 24, borderRadius: '50%',
                          background: config.bg, border: `2px solid ${config.color}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11,
                        }}>
                          {config.icon}
                        </div>

                        {/* Card */}
                        <Link href={item.href} style={{
                          display: 'block', marginLeft: 36,
                          background: 'var(--bg-card)', border: `1px solid ${isToday ? config.color : isSoon ? `${config.color}40` : 'var(--border)'}`,
                          borderRadius: 10, padding: '14px 16px', textDecoration: 'none',
                          transition: 'all var(--transition)',
                          boxShadow: isToday ? `0 0 0 2px ${config.color}20` : 'none',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = config.color)}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = isToday ? config.color : isSoon ? `${config.color}40` : 'var(--border)')}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: config.color, background: config.bg, padding: '2px 8px', borderRadius: 4 }}>
                                  {config.label}
                                </span>
                                {item.priority && (
                                  <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 4, textTransform: 'capitalize' }}>
                                    {item.priority}
                                  </span>
                                )}
                                {isToday && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-light)', background: 'var(--accent-glow)', padding: '2px 8px', borderRadius: 4 }}>TODAY</span>}
                              </div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{item.title}</div>
                              {item.description && (
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{item.description}</div>
                              )}
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: isOverdue ? 'var(--rose)' : isToday ? 'var(--accent-light)' : isSoon ? 'var(--amber)' : 'var(--text-muted)' }}>
                                {isOverdue ? `Overdue ${Math.abs(daysDiff)}d` : isToday ? 'Due Today' : daysDiff === 1 ? 'Due Tomorrow' : `${daysDiff}d left`}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                {formatDate(item.date)}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
