'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Plus, Target, Filter, Search } from 'lucide-react';
import { useAppStore } from '@/store';
import { getDaysRemainingWithStart, getGoalHealth } from '@/lib/date';
import { cn } from '@/utils/cn';

const STATUS_TABS = ['all', 'active', 'completed', 'paused'] as const;
const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

function ProgressBar({ value, color = 'var(--accent)' }: { value: number; color?: string }) {
  return (
    <div style={{ background: 'var(--bg-tertiary)', borderRadius: 999, height: 6, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(100, value)}%`, background: color, borderRadius: 999, transition: 'width 0.8s ease' }} />
    </div>
  );
}

export default function GoalsPage() {
  const { goals } = useAppStore();
  const [activeTab, setActiveTab] = useState<typeof STATUS_TABS[number]>('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filtered = goals
    .filter(g => activeTab === 'all' || g.status === activeTab)
    .filter(g => search === '' || g.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99));

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Goals</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {goals.filter(g => g.status === 'active').length} active · {goals.filter(g => g.status === 'completed').length} completed
          </p>
        </div>
        <Link href="/goals/new" className="btn btn-primary" style={{ gap: 8 }}>
          <Plus size={16} /> New Goal
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-tertiary)', borderRadius: 10, padding: 4 }}>
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
                background: activeTab === tab ? 'var(--bg-card)' : 'transparent',
                color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
                transition: 'all var(--transition)',
                boxShadow: activeTab === tab ? 'var(--shadow)' : 'none',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search goals..."
            className="input"
            style={{ paddingLeft: 36 }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="card-grid card-grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Goals', value: goals.length, color: 'var(--accent-light)' },
          { label: 'Active', value: goals.filter(g => g.status === 'active').length, color: 'var(--indigo)' },
          { label: 'Completed', value: goals.filter(g => g.status === 'completed').length, color: 'var(--emerald)' },
          { label: 'Overdue', value: goals.filter(g => {
            const di = getDaysRemainingWithStart(g.start_date, g.target_date);
            return di.days < 0 && g.status === 'active';
          }).length, color: 'var(--rose)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Goals grid */}
      {filtered.length === 0 ? (
        <div className="glass" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>No goals yet</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
            Turn something you want to achieve into a measurable goal.
          </div>
          <Link href="/goals/new" className="btn btn-primary">+ Create Goal</Link>
        </div>
      ) : (
        <div className="card-grid card-grid-3">
          {filtered.map(goal => {
            const progress = goal.target_value > 0 ? (goal.current_value / goal.target_value) * 100 : 0;
            const daysInfo = getDaysRemainingWithStart(goal.start_date, goal.target_date);
            const health = getGoalHealth(goal.start_date, goal.target_date, goal.current_value, goal.target_value);
            const healthColors = { on_track: 'var(--emerald)', needs_attention: 'var(--amber)', behind: 'var(--rose)' };
            const priorityColors = { low: 'var(--emerald)', medium: 'var(--amber)', high: '#f97316', critical: 'var(--rose)' };
            const statusColors = { active: 'var(--indigo)', completed: 'var(--emerald)', paused: 'var(--amber)', abandoned: 'var(--text-muted)' };

            return (
              <Link key={goal.id} href={`/goals/${goal.id}`} style={{ textDecoration: 'none' }}>
                <div className="glass" style={{ padding: 20, cursor: 'pointer', height: '100%' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, wordBreak: 'break-word' }}>
                        {goal.title}
                      </div>
                      {goal.description && (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {goal.description}
                        </div>
                      )}
                    </div>
                    <div style={{ marginLeft: 8 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                        color: priorityColors[goal.priority],
                        background: `${priorityColors[goal.priority]}15`,
                        padding: '3px 8px', borderRadius: 4,
                      }}>
                        {goal.priority}
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {goal.unit ? `${goal.current_value.toLocaleString()} ${goal.unit}` : `${Math.round(progress)}%`}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {goal.unit ? `of ${goal.target_value.toLocaleString()} ${goal.unit}` : 'complete'}
                      </span>
                    </div>
                    <ProgressBar value={progress} color={healthColors[health.status]} />
                  </div>

                  {/* Days remaining */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: 12, fontWeight: 600,
                      color: daysInfo.status === 'overdue' ? 'var(--rose)' : daysInfo.status === 'due_today' || daysInfo.status === 'due_tomorrow' ? 'var(--amber)' : 'var(--text-muted)',
                    }}>
                      {daysInfo.label}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
                      color: healthColors[health.status],
                      background: `${healthColors[health.status]}15`,
                      padding: '2px 8px', borderRadius: 4,
                    }}>
                      {health.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Status */}
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: 11, color: statusColors[goal.status],
                      background: `${statusColors[goal.status]}15`,
                      padding: '2px 8px', borderRadius: 4, fontWeight: 600, textTransform: 'capitalize',
                    }}>
                      {goal.status}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {Math.round(progress)}% done · {Math.round(100 - daysInfo.percentTimeElapsed)}% time left
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
