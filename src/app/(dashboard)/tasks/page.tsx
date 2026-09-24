'use client';
import { useState } from 'react';
import { Plus, CheckCircle2, Clock, Flag, Trash2, Circle, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store';
import toast from 'react-hot-toast';
import type { Task } from '@/types';

const PRIORITY_COLORS: Record<string, string> = { low: 'var(--emerald)', medium: 'var(--amber)', high: '#f97316', critical: 'var(--rose)' };
const STATUS_ORDER: Record<string, number> = { overdue: 0, in_progress: 1, todo: 2, completed: 3 };

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, completeTask, goals, habits } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | Task['status']>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | Task['priority']>('all');
  const [form, setForm] = useState<{
    title: string; description: string; due_date: string; due_time: string;
    priority: Task['priority']; status: Task['status']; goal_id: string; tags: string;
  }>({
    title: '', description: '', due_date: '', due_time: '', priority: 'medium', status: 'todo', goal_id: '', tags: '',
  });

  const today = new Date().toISOString().split('T')[0];

  // Auto-mark overdue tasks
  const processedTasks = tasks.map(t => ({
    ...t,
    status: (t.status !== 'completed' && t.due_date && t.due_date < today) ? 'overdue' as Task['status'] : t.status,
  }));

  const filtered = processedTasks
    .filter(t => filterStatus === 'all' || t.status === filterStatus)
    .filter(t => filterPriority === 'all' || t.priority === filterPriority)
    .sort((a, b) => (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    addTask({
      title: form.title, description: form.description,
      due_date: form.due_date || undefined, due_time: form.due_time || undefined,
      priority: form.priority, status: form.status,
      goal_id: form.goal_id || undefined,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
      is_recurring: false,
    });
    setForm({ title: '', description: '', due_date: '', due_time: '', priority: 'medium', status: 'todo', goal_id: '', tags: '' });
    setShowForm(false);
    toast.success('Task added!');
  };

  const stats = {
    total: tasks.length,
    todo: processedTasks.filter(t => t.status === 'todo').length,
    in_progress: processedTasks.filter(t => t.status === 'in_progress').length,
    completed: processedTasks.filter(t => t.status === 'completed').length,
    overdue: processedTasks.filter(t => t.status === 'overdue').length,
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Tasks</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {stats.completed}/{stats.total} completed · {stats.overdue} overdue
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ gap: 8 }}>
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Stats row */}
      <div className="card-grid card-grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'To Do', value: stats.todo, color: 'var(--text-muted)', status: 'todo' as const },
          { label: 'In Progress', value: stats.in_progress, color: 'var(--indigo)', status: 'in_progress' as const },
          { label: 'Completed', value: stats.completed, color: 'var(--emerald)', status: 'completed' as const },
          { label: 'Overdue', value: stats.overdue, color: 'var(--rose)', status: 'overdue' as const },
        ].map(({ label, value, color, status }) => (
          <button key={label} onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
            className="glass" style={{
              padding: 16, textAlign: 'center', cursor: 'pointer',
              border: filterStatus === status ? `1px solid ${color}` : '1px solid var(--border)',
            }}>
            <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>Priority:</span>
        {(['all', 'critical', 'high', 'medium', 'low'] as const).map(p => (
          <button key={p} onClick={() => setFilterPriority(p as any)} style={{
            padding: '5px 12px', borderRadius: 999, border: `1px solid ${filterPriority === p ? (PRIORITY_COLORS[p] || 'var(--accent)') : 'var(--border)'}`,
            background: filterPriority === p ? `${PRIORITY_COLORS[p] || 'var(--accent)'}15` : 'transparent',
            color: filterPriority === p ? (PRIORITY_COLORS[p] || 'var(--accent)') : 'var(--text-muted)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
          }}>
            {p}
          </button>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>New Task</h3>
          <form onSubmit={handleAdd}>
            <div style={{ marginBottom: 12 }}>
              <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Task title *" required />
            </div>
            <div style={{ marginBottom: 12 }}>
              <textarea className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" rows={2} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Due Date</label>
                <input type="date" className="input" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Due Time</label>
                <input type="time" className="input" value={form.due_time} onChange={e => setForm(f => ({ ...f, due_time: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Priority</label>
                <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as any }))} style={{ cursor: 'pointer' }}>
                  {['low', 'medium', 'high', 'critical'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Status</label>
                <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))} style={{ cursor: 'pointer' }}>
                  {['todo', 'in_progress', 'completed'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Related Goal</label>
                <select className="input" value={form.goal_id} onChange={e => setForm(f => ({ ...f, goal_id: e.target.value }))} style={{ cursor: 'pointer' }}>
                  <option value="">None</option>
                  {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Tags (comma-separated)</label>
                <input className="input" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="design, urgent" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Add Task</button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks list */}
      {filtered.length === 0 ? (
        <div className="glass" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
            {filterStatus === 'completed' ? 'No completed tasks yet' : filterStatus === 'overdue' ? 'No overdue tasks!' : 'All clear!'}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
            {filterStatus === 'all' ? 'Create your first task to get started.' : `No ${filterStatus.replace('_', ' ')} tasks.`}
          </div>
          {filterStatus === 'all' && (
            <button onClick={() => setShowForm(true)} className="btn btn-primary">+ Add Task</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(task => {
            const isDone = task.status === 'completed';
            const isOverdue = task.status === 'overdue';
            const pColor = PRIORITY_COLORS[task.priority] || 'var(--text-muted)';
            const relatedGoal = task.goal_id ? goals.find(g => g.id === task.goal_id) : null;

            return (
              <div key={task.id} className="glass" style={{
                padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
                opacity: isDone ? 0.65 : 1,
                borderLeft: `3px solid ${isOverdue ? 'var(--rose)' : pColor}`,
              }}>
                {/* Complete button */}
                <button
                  onClick={() => { if (!isDone) completeTask(task.id); else updateTask(task.id, { status: 'todo', completed_at: undefined }); }}
                  style={{
                    width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                    border: `2px solid ${isDone ? 'var(--emerald)' : 'var(--border)'}`,
                    background: isDone ? 'var(--emerald)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all var(--transition)', color: 'white', fontSize: 12,
                  }}
                  aria-label={isDone ? 'Undo' : 'Complete'}
                >
                  {isDone && '✓'}
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: isDone ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none' }}>
                      {task.title}
                    </span>
                    {isOverdue && <AlertTriangle size={13} color="var(--rose)" />}
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: pColor, background: `${pColor}15`, padding: '2px 6px', borderRadius: 3 }}>
                      {task.priority}
                    </span>
                    {relatedGoal && (
                      <span style={{ fontSize: 10, color: 'var(--accent-light)', background: 'var(--accent-glow)', padding: '2px 6px', borderRadius: 3 }}>
                        🎯 {relatedGoal.title}
                      </span>
                    )}
                    {(task.tags || []).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  {task.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{task.description}</div>}
                  {task.due_date && (
                    <div style={{ fontSize: 11, color: isOverdue ? 'var(--rose)' : 'var(--text-muted)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} />
                      {isOverdue ? `Overdue · was due ${task.due_date}` : `Due ${task.due_date}${task.due_time ? ` at ${task.due_time}` : ''}`}
                    </div>
                  )}
                </div>

                {/* Status badge */}
                <span style={{
                  fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
                  color: task.status === 'in_progress' ? 'var(--indigo)' : task.status === 'overdue' ? 'var(--rose)' : task.status === 'completed' ? 'var(--emerald)' : 'var(--text-muted)',
                  background: task.status === 'in_progress' ? 'rgba(99,102,241,0.1)' : task.status === 'overdue' ? 'rgba(244,63,94,0.1)' : task.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'var(--bg-tertiary)',
                  padding: '3px 10px', borderRadius: 4, whiteSpace: 'nowrap',
                }}>
                  {task.status.replace('_', ' ')}
                </span>

                {/* Change status */}
                {!isDone && task.status !== 'in_progress' && (
                  <button onClick={() => updateTask(task.id, { status: 'in_progress' })} className="btn btn-ghost btn-sm" style={{ fontSize: 11, color: 'var(--indigo)', whiteSpace: 'nowrap' }}>
                    Start
                  </button>
                )}

                <button onClick={() => { deleteTask(task.id); toast.success('Task deleted'); }} className="btn btn-ghost btn-icon btn-sm" aria-label="Delete task">
                  <Trash2 size={14} color="var(--text-muted)" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
