'use client';
import { use, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, Trash2, Plus, CheckCircle, Circle, Clock, TrendingUp, Target } from 'lucide-react';
import { useAppStore } from '@/store';
import { getDaysRemainingWithStart, getGoalHealth, formatDate } from '@/lib/date';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

function CircularProgress({ value, size = 120, strokeWidth = 10, color = '#7c3aed' }: any) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--bg-tertiary)" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dy=".3em" fill="var(--text-primary)" fontSize={size/5} fontWeight={800}>
        {Math.round(value)}%
      </text>
    </svg>
  );
}

export default function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { goals, milestones, habits, tasks, updateGoal, deleteMilestone, addMilestone, updateMilestone, deleteGoal } = useAppStore();
  const router = useRouter();
  const [showEditProgress, setShowEditProgress] = useState(false);
  const [newProgressValue, setNewProgressValue] = useState(0);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDate, setMilestoneDate] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'habits' | 'tasks'>('overview');

  const goal = goals.find(g => g.id === id);
  if (!goal) return (
    <div className="fade-in" style={{ textAlign: 'center', padding: 80 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
      <h2 style={{ fontSize: 20, color: 'var(--text-secondary)', marginBottom: 16 }}>Goal not found</h2>
      <Link href="/goals" className="btn btn-primary">Back to Goals</Link>
    </div>
  );

  const goalMilestones = milestones.filter(m => m.goal_id === id).sort((a, b) => a.sort_order - b.sort_order);
  const goalHabits = habits.filter(h => h.goal_id === id);
  const goalTasks = tasks.filter(t => t.goal_id === id);

  const progress = goal.target_value > 0 ? (goal.current_value / goal.target_value) * 100 : 0;
  const daysInfo = getDaysRemainingWithStart(goal.start_date, goal.target_date);
  const health = getGoalHealth(goal.start_date, goal.target_date, goal.current_value, goal.target_value);
  const healthColors = { on_track: 'var(--emerald)', needs_attention: 'var(--amber)', behind: 'var(--rose)' };

  const handleDelete = () => {
    if (window.confirm(`Delete "${goal.title}"? This cannot be undone.`)) {
      deleteGoal(id);
      toast.success('Goal deleted');
      router.push('/goals');
    }
  };

  const handleUpdateProgress = () => {
    updateGoal(id, { current_value: newProgressValue });
    setShowEditProgress(false);
    toast.success('Progress updated!');
  };

  const handleAddMilestone = () => {
    if (!milestoneTitle.trim()) return;
    addMilestone({
      goal_id: id,
      title: milestoneTitle,
      target_date: milestoneDate || undefined,
      status: 'pending',
      current_value: 0,
      sort_order: goalMilestones.length,
    });
    setMilestoneTitle('');
    setMilestoneDate('');
    setShowMilestoneForm(false);
    toast.success('Milestone added!');
  };

  return (
    <div className="fade-in">
      {/* Back + actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <Link href="/goals" className="btn btn-ghost" style={{ gap: 8 }}>
          <ArrowLeft size={16} /> Goals
        </Link>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { setNewProgressValue(goal.current_value); setShowEditProgress(true); }} className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
            <TrendingUp size={14} /> Update Progress
          </button>
          <button onClick={handleDelete} className="btn btn-danger btn-sm" style={{ gap: 6 }}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Goal header */}
      <div className="glass" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <CircularProgress value={progress} size={120} color={healthColors[health.status]} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                color: healthColors[health.status], background: `${healthColors[health.status]}15`,
                padding: '3px 10px', borderRadius: 4,
              }}>
                {health.status.replace('_', ' ')}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                color: 'var(--accent-light)', background: 'var(--accent-glow)',
                padding: '3px 10px', borderRadius: 4,
              }}>
                {goal.priority} priority
              </span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>{goal.title}</h1>
            {goal.description && <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>{goal.description}</p>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
              {[
                { label: 'Current', value: goal.unit ? `${goal.current_value.toLocaleString()} ${goal.unit}` : `${goal.current_value}` },
                { label: 'Target', value: goal.unit ? `${goal.target_value.toLocaleString()} ${goal.unit}` : `${goal.target_value}` },
                { label: 'Time Left', value: daysInfo.label, color: daysInfo.status === 'overdue' ? 'var(--rose)' : undefined },
                { label: 'Start Date', value: formatDate(goal.start_date) },
                { label: 'Target Date', value: formatDate(goal.target_date) },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: color || 'var(--text-primary)' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress vs time */}
        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
              <span style={{ color: 'var(--text-muted)' }}>Goal Progress</span>
              <span style={{ color: healthColors[health.status], fontWeight: 700 }}>{Math.round(progress)}%</span>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, progress)}%`, background: healthColors[health.status], borderRadius: 999, transition: 'width 0.8s ease' }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
              <span style={{ color: 'var(--text-muted)' }}>Time Elapsed</span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>{Math.round(daysInfo.percentTimeElapsed)}%</span>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, daysInfo.percentTimeElapsed)}%`, background: 'var(--indigo)', borderRadius: 999, transition: 'width 0.8s ease' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-tertiary)', borderRadius: 10, padding: 4, marginBottom: 20, width: 'fit-content' }}>
        {(['overview', 'milestones', 'habits', 'tasks'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '7px 18px', borderRadius: 7, border: 'none', cursor: 'pointer',
            background: activeTab === tab ? 'var(--bg-card)' : 'transparent',
            color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
            fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
            transition: 'all var(--transition)',
            boxShadow: activeTab === tab ? 'var(--shadow)' : 'none',
          }}>
            {tab}
            <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>
              {tab === 'milestones' ? goalMilestones.length : tab === 'habits' ? goalHabits.length : tab === 'tasks' ? goalTasks.length : ''}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Notes</h3>
          {goal.notes ? (
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{goal.notes}</p>
          ) : (
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No notes added.</p>
          )}
        </div>
      )}

      {activeTab === 'milestones' && (
        <div className="glass" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Milestones</h3>
            <button onClick={() => setShowMilestoneForm(!showMilestoneForm)} className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
              <Plus size={12} /> Add Milestone
            </button>
          </div>

          {showMilestoneForm && (
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 8, padding: 16, marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input className="input" style={{ flex: 2, minWidth: 150 }} value={milestoneTitle} onChange={e => setMilestoneTitle(e.target.value)} placeholder="Milestone title..." />
              <input type="date" className="input" style={{ flex: 1, minWidth: 130 }} value={milestoneDate} onChange={e => setMilestoneDate(e.target.value)} />
              <button onClick={handleAddMilestone} className="btn btn-primary btn-sm">Add</button>
              <button onClick={() => setShowMilestoneForm(false)} className="btn btn-ghost btn-sm">Cancel</button>
            </div>
          )}

          {goalMilestones.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 14 }}>
              No milestones yet. Break your goal into smaller steps!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
              {goalMilestones.map((ms, i) => {
                const statusIcon = ms.status === 'completed' ? '✅' : ms.status === 'in_progress' ? '→' : '○';
                const statusColor = ms.status === 'completed' ? 'var(--emerald)' : ms.status === 'in_progress' ? 'var(--accent-light)' : 'var(--text-muted)';
                return (
                  <div key={ms.id} style={{ display: 'flex', gap: 16, paddingBottom: 20, position: 'relative' }}>
                    {/* Timeline line */}
                    {i < goalMilestones.length - 1 && (
                      <div style={{ position: 'absolute', left: 15, top: 32, bottom: 0, width: 2, background: 'var(--border)' }} />
                    )}
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                      background: ms.status === 'completed' ? 'var(--emerald)' : ms.status === 'in_progress' ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
                      border: `2px solid ${statusColor}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                    }}>
                      {statusIcon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: ms.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: ms.status === 'completed' ? 'line-through' : 'none' }}>
                          {ms.title}
                        </span>
                        {ms.target_date && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(ms.target_date)}</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                        {ms.status !== 'completed' && (
                          <button onClick={() => { updateMilestone(ms.id, { status: 'completed' }); toast.success('Milestone completed! 🎉'); }}
                            className="btn btn-ghost btn-sm" style={{ fontSize: 11, color: 'var(--emerald)', padding: '3px 8px' }}>
                            Mark Done
                          </button>
                        )}
                        {ms.status === 'pending' && (
                          <button onClick={() => updateMilestone(ms.id, { status: 'in_progress' })}
                            className="btn btn-ghost btn-sm" style={{ fontSize: 11, color: 'var(--accent-light)', padding: '3px 8px' }}>
                            Start
                          </button>
                        )}
                        <button onClick={() => { deleteMilestone(ms.id); toast.success('Milestone removed'); }}
                          className="btn btn-ghost btn-sm" style={{ fontSize: 11, color: 'var(--rose)', padding: '3px 8px' }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'habits' && (
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Related Habits</h3>
          {goalHabits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 14 }}>
              No habits linked to this goal. <Link href="/habits" style={{ color: 'var(--accent-light)' }}>Create one →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {goalHabits.map(habit => (
                <Link key={habit.id} href={`/habits/${habit.id}`} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  background: 'var(--bg-tertiary)', borderRadius: 8, textDecoration: 'none',
                  border: '1px solid var(--border)', transition: 'all var(--transition)',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <span style={{ fontSize: 22 }}>{habit.icon || '📌'}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{habit.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{habit.frequency} · {habit.target_value} {habit.unit}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Related Tasks</h3>
          {goalTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 14 }}>
              No tasks linked to this goal. <Link href="/tasks" style={{ color: 'var(--accent-light)' }}>Create one →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {goalTasks.map(task => (
                <div key={task.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  background: 'var(--bg-tertiary)', borderRadius: 8,
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ width: 4, height: 32, borderRadius: 2, background: task.status === 'completed' ? 'var(--emerald)' : task.priority === 'critical' ? 'var(--rose)' : 'var(--accent)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                      {task.title}
                    </div>
                    {task.due_date && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Due {task.due_date}</div>}
                  </div>
                  <span style={{ fontSize: 11, color: task.status === 'completed' ? 'var(--emerald)' : 'var(--text-muted)', fontWeight: 600, textTransform: 'capitalize' }}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Update Progress Modal */}
      {showEditProgress && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setShowEditProgress(false)}>
          <div className="glass" style={{ padding: 28, width: 360, margin: '0 16px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Update Progress</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                Current Value {goal.unit ? `(${goal.unit})` : ''}
              </label>
              <input
                type="number"
                className="input"
                value={newProgressValue}
                onChange={e => setNewProgressValue(Number(e.target.value))}
                min={0} max={goal.target_value}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                Target: {goal.target_value} {goal.unit}
              </div>
            </div>
            <div style={{ marginBottom: 16, background: 'var(--bg-tertiary)', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Preview</div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, (newProgressValue / goal.target_value) * 100)}%`, background: 'var(--accent)', borderRadius: 999, transition: 'width 0.3s ease' }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 6 }}>
                {Math.round((newProgressValue / goal.target_value) * 100)}% complete
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowEditProgress(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleUpdateProgress} className="btn btn-primary" style={{ flex: 2 }}>Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
