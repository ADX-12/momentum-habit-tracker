'use client';
import { useState, useMemo } from 'react';
import { useAppStore } from '@/store';
import { calculateStreak } from '@/lib/date';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

type ReviewTab = 'daily' | 'weekly' | 'monthly';

const MOOD_EMOJIS = ['😞', '😕', '😐', '🙂', '😄'];

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState<ReviewTab>('daily');
  const {
    habits, habitLogs, tasks, dailyReviews, weeklyReviews,
    addDailyReview, deleteDailyReview, addWeeklyReview, deleteWeeklyReview,
    goals, milestones,
  } = useAppStore();

  const today = new Date().toISOString().split('T')[0];
  const todayReview = dailyReviews.find(r => r.review_date === today);

  const [dailyForm, setDailyForm] = useState({
    reflection: '',
    tomorrow_focus: '',
    mood: 3,
  });

  // Today's stats
  const todayLogs = habitLogs.filter(l => l.log_date === today);
  const completedHabits = todayLogs.filter(l => l.status === 'completed').length;
  const missedHabits = todayLogs.filter(l => l.status === 'missed').length;
  const todayTasks = tasks.filter(t => t.due_date === today);
  const completedTasks = tasks.filter(t => t.status === 'completed' && t.due_date === today).length;

  // Weekly stats (last 7 days)
  const weeklyStats = useMemo(() => {
    const weekLogs = habitLogs.filter(l => {
      const d = new Date(l.log_date);
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    });
    const completed = weekLogs.filter(l => l.status === 'completed').length;
    const total = weekLogs.length;
    const habitPct = total > 0 ? Math.round((completed / total) * 100) : 0;

    const weekTasks = tasks.filter(t => {
      if (!t.due_date) return false;
      const d = new Date(t.due_date);
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    });
    const completedWeekTasks = weekTasks.filter(t => t.status === 'completed').length;
    const taskPct = weekTasks.length > 0 ? Math.round((completedWeekTasks / weekTasks.length) * 100) : 0;

    const bestStreak = habits.reduce((max, habit) => {
      const logs = habitLogs.filter(l => l.habit_id === habit.id);
      return Math.max(max, calculateStreak(logs).currentStreak);
    }, 0);

    const completedMilestones = milestones.filter(m => {
      if (!m.updated_at) return false;
      const d = new Date(m.updated_at);
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      return m.status === 'completed' && d >= weekAgo;
    }).length;

    return { habitPct, taskPct, bestStreak, completedMilestones, missed: total - completed };
  }, [habits, habitLogs, tasks, milestones]);

  const handleSubmitDaily = () => {
    if (todayReview) { toast.error('Already reviewed today!'); return; }
    addDailyReview({
      review_date: today,
      completed_habits: completedHabits,
      missed_habits: missedHabits,
      completed_tasks: completedTasks,
      missed_tasks: todayTasks.length - completedTasks,
      reflection: dailyForm.reflection,
      tomorrow_focus: dailyForm.tomorrow_focus,
      mood: dailyForm.mood,
    });
    toast.success('Daily review saved! 🎉');
  };

  const handleDeleteDaily = (id: string) => {
    if (window.confirm('Delete this daily review?')) {
      deleteDailyReview(id);
      toast.success('Daily review deleted');
    }
  };

  const handleSubmitWeekly = () => {
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    addWeeklyReview({
      week_start: weekStart.toISOString().split('T')[0],
      week_end: new Date().toISOString().split('T')[0],
      habit_completion_pct: weeklyStats.habitPct,
      task_completion_pct: weeklyStats.taskPct,
      milestones_completed: weeklyStats.completedMilestones,
      best_streak: weeklyStats.bestStreak,
      missed_habits: weeklyStats.missed,
    });
    toast.success('Weekly review saved!');
  };

  const handleDeleteWeekly = (id: string) => {
    if (window.confirm('Delete this weekly review?')) {
      deleteWeeklyReview(id);
      toast.success('Weekly review deleted');
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Reviews</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Reflect, improve, and plan ahead</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-tertiary)', borderRadius: 10, padding: 4, marginBottom: 28, width: 'fit-content' }}>
        {(['daily', 'weekly', 'monthly'] as ReviewTab[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '7px 20px', borderRadius: 7, border: 'none', cursor: 'pointer',
            background: activeTab === tab ? 'var(--bg-card)' : 'transparent',
            color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
            fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
            transition: 'all var(--transition)',
          }}>{tab}</button>
        ))}
      </div>

      {/* Daily Review */}
      {activeTab === 'daily' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Today's stats */}
          <div className="glass" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Today's Summary</h3>
            <div className="card-grid card-grid-2" style={{ marginBottom: 20 }}>
              {[
                { label: 'Habits Done', value: completedHabits, total: habits.length, color: 'var(--emerald)' },
                { label: 'Habits Missed', value: missedHabits, total: habits.length, color: 'var(--rose)' },
                { label: 'Tasks Done', value: completedTasks, total: todayTasks.length, color: 'var(--indigo)' },
                { label: 'Tasks Left', value: todayTasks.length - completedTasks, total: todayTasks.length, color: 'var(--amber)' },
              ].map(({ label, value, total, color }) => (
                <div key={label} style={{ padding: '12px 14px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{label} {total > 0 ? `/ ${total}` : ''}</div>
                </div>
              ))}
            </div>

            {todayReview ? (
              <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--emerald)' }}>✓ Today's review submitted</div>
                  <button
                    onClick={() => handleDeleteDaily(todayReview.id)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--rose)', padding: '4px 8px', fontSize: 11, gap: 4 }}
                  >
                    <Trash2 size={13} /> Delete Review
                  </button>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Mood: {MOOD_EMOJIS[(todayReview.mood || 3) - 1]}</div>
                {todayReview.reflection && <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{todayReview.reflection}"</div>}
              </div>
            ) : (
              <div style={{ background: 'var(--accent-glow)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 8, padding: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                📝 Complete your daily review to track patterns over time
              </div>
            )}
          </div>

          {/* Review form */}
          {!todayReview && (
            <div className="glass" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Daily Reflection</h3>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>How do you feel today?</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {MOOD_EMOJIS.map((emoji, i) => (
                    <button key={i} onClick={() => setDailyForm(f => ({ ...f, mood: i + 1 }))}
                      style={{
                        fontSize: 28, background: 'none', border: `2px solid ${dailyForm.mood === i + 1 ? 'var(--accent)' : 'transparent'}`,
                        borderRadius: 8, padding: 4, cursor: 'pointer', transition: 'all var(--transition)',
                        transform: dailyForm.mood === i + 1 ? 'scale(1.2)' : 'scale(1)',
                      }}
                      aria-label={`Mood ${i + 1}`}
                    >{emoji}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>What did you accomplish?</label>
                <textarea className="input" value={dailyForm.reflection} onChange={e => setDailyForm(f => ({ ...f, reflection: e.target.value }))}
                  placeholder="What went well today? What did you learn?" rows={3} style={{ resize: 'vertical' }} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>What's your focus for tomorrow?</label>
                <textarea className="input" value={dailyForm.tomorrow_focus} onChange={e => setDailyForm(f => ({ ...f, tomorrow_focus: e.target.value }))}
                  placeholder="Top 1-3 priorities for tomorrow..." rows={3} style={{ resize: 'vertical' }} />
              </div>

              <button onClick={handleSubmitDaily} className="btn btn-primary" style={{ width: '100%' }}>
                Save Daily Review ✓
              </button>
            </div>
          )}

          {todayReview && (
            <div className="glass" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>Tomorrow's Focus</h3>
                <button
                  onClick={() => handleDeleteDaily(todayReview.id)}
                  className="btn btn-danger btn-sm"
                  style={{ fontSize: 11, gap: 4 }}
                >
                  <Trash2 size={12} /> Delete Review
                </button>
              </div>
              {todayReview.tomorrow_focus ? (
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{todayReview.tomorrow_focus}</div>
              ) : (
                <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>No focus set for tomorrow.</div>
              )}
            </div>
          )}

          {/* Past reviews */}
          {dailyReviews.length > 0 && (
            <div className="glass" style={{ padding: 24, gridColumn: '1 / -1' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Past Reviews</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[...dailyReviews].sort((a, b) => b.review_date.localeCompare(a.review_date)).slice(0, 14).map(review => (
                  <div key={review.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                    <div style={{ fontSize: 24 }}>{MOOD_EMOJIS[(review.mood || 3) - 1]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {new Date(review.review_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {review.completed_habits}/{review.completed_habits + review.missed_habits} habits · {review.completed_tasks} tasks done
                        </span>
                      </div>
                      {review.reflection && <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>"{review.reflection}"</div>}
                    </div>
                    <button
                      onClick={() => handleDeleteDaily(review.id)}
                      className="btn btn-ghost btn-sm"
                      title="Delete this review"
                      style={{ color: 'var(--text-muted)', padding: '6px' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--rose)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Weekly Review */}
      {activeTab === 'weekly' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="glass" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>This Week's Performance</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Habit Completion', value: weeklyStats.habitPct, unit: '%', color: 'var(--emerald)' },
                { label: 'Task Completion', value: weeklyStats.taskPct, unit: '%', color: 'var(--indigo)' },
                { label: 'Best Streak', value: weeklyStats.bestStreak, unit: ' days 🔥', color: 'var(--amber)' },
                { label: 'Milestones Done', value: weeklyStats.completedMilestones, unit: '', color: 'var(--accent-light)' },
                { label: 'Habits Missed', value: weeklyStats.missed, unit: '', color: 'var(--rose)' },
              ].map(({ label, value, unit, color }) => (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color }}>{value}{unit}</span>
                  </div>
                  {unit === '%' && (
                    <div style={{ background: 'var(--bg-tertiary)', borderRadius: 999, height: 6, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 999, transition: 'width 0.8s ease' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button onClick={handleSubmitWeekly} className="btn btn-primary" style={{ width: '100%', marginTop: 20 }}>
              Save Weekly Review
            </button>
          </div>

          {/* Past weekly reviews */}
          <div className="glass" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Past Weekly Reviews</h3>
            {weeklyReviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 14 }}>
                No past weekly reviews
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[...weeklyReviews].sort((a, b) => b.week_start.localeCompare(a.week_start)).map(review => (
                  <div key={review.id} style={{ padding: '14px 16px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                        Week of {new Date(review.week_start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                      <button
                        onClick={() => handleDeleteWeekly(review.id)}
                        className="btn btn-ghost btn-sm"
                        title="Delete this weekly review"
                        style={{ color: 'var(--text-muted)', padding: '4px' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--rose)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Habits: <strong style={{ color: 'var(--emerald)' }}>{review.habit_completion_pct}%</strong></div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tasks: <strong style={{ color: 'var(--indigo)' }}>{review.task_completion_pct}%</strong></div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Best streak: <strong style={{ color: 'var(--amber)' }}>{review.best_streak}d 🔥</strong></div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Milestones: <strong style={{ color: 'var(--accent-light)' }}>{review.milestones_completed}</strong></div>
                    </div>
                    {review.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic' }}>"{review.notes}"</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Monthly Review */}
      {activeTab === 'monthly' && (
        <div className="glass" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>
            Monthly Overview — {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="card-grid card-grid-3" style={{ marginBottom: 24 }}>
            {[
              { label: 'Active Goals', value: goals.filter(g => g.status === 'active').length, color: 'var(--accent-light)' },
              { label: 'Completed Goals', value: goals.filter(g => g.status === 'completed').length, color: 'var(--emerald)' },
              { label: 'Milestones Done', value: milestones.filter(m => m.status === 'completed').length, color: 'var(--indigo)' },
              { label: 'Total Habits', value: habits.length, color: 'var(--amber)' },
              { label: 'Tasks Completed', value: tasks.filter(t => t.status === 'completed').length, color: 'var(--emerald)' },
              { label: 'Habits Logged', value: habitLogs.length, color: 'var(--accent-light)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--accent-glow)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10, padding: 16, fontSize: 14, color: 'var(--text-muted)' }}>
            💡 Monthly reviews will accumulate as you use the app over time. Keep tracking your habits and goals!
          </div>
        </div>
      )}
    </div>
  );
}
