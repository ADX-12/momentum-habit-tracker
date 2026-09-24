'use client';
import { useState } from 'react';
import { useAppStore } from '@/store';
import { Sun, Moon, Monitor, Bell, Database, Download, User, Palette, Globe, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

type SettingsTab = 'profile' | 'appearance' | 'notifications' | 'data';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const { theme, setTheme, goals, habits, tasks, habitLogs } = useAppStore();
  const [name, setName] = useState('Apurva');
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  const handleExportJSON = () => {
    const data = { goals, habits, tasks, habitLogs, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `momentum-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('Data exported as JSON');
  };

  const handleExportCSV = () => {
    const headers = ['Type', 'Title', 'Status', 'Priority', 'Start/Date', 'End/DueDate', 'Progress'];
    const rows = [
      ...goals.map(g => ['Goal', g.title, g.status, g.priority, g.start_date, g.target_date, `${g.current_value}/${g.target_value}`]),
      ...habits.map(h => ['Habit', h.title, h.is_active ? 'active' : 'inactive', '', h.start_date, h.end_date || '', `${h.target_value} ${h.unit}`]),
      ...tasks.map(t => ['Task', t.title, t.status, t.priority, '', t.due_date || '', '']),
    ];
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `momentum-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('Data exported as CSV');
  };

  const TABS: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & Export', icon: Database },
  ];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Configure your Momentum experience</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
        {/* Sidebar tabs */}
        <div className="glass" style={{ padding: 8, alignSelf: 'start' }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: activeTab === id ? 'var(--accent-glow)' : 'transparent',
              color: activeTab === id ? 'var(--accent-light)' : 'var(--text-muted)',
              fontSize: 13, fontWeight: 600, transition: 'all var(--transition)', textAlign: 'left',
            }}>
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {activeTab === 'profile' && (
            <div className="glass" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Profile Settings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Display Name</label>
                  <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={{ maxWidth: 320 }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Timezone</label>
                  <select className="input" value={timezone} onChange={e => setTimezone(e.target.value)} style={{ maxWidth: 320, cursor: 'pointer' }}>
                    {[
                      'Asia/Kolkata', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Singapore', 'Australia/Sydney'
                    ].map(tz => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Default: Asia/Kolkata (IST)</div>
                </div>
                <div>
                  <button onClick={() => toast.success('Profile saved!')} className="btn btn-primary">Save Profile</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="glass" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Appearance</h3>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 12 }}>Theme</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[
                    { value: 'dark', label: 'Dark', icon: Moon, desc: 'Dark backgrounds' },
                    { value: 'light', label: 'Light', icon: Sun, desc: 'Light backgrounds' },
                    { value: 'system', label: 'System', icon: Monitor, desc: 'Follow OS setting' },
                  ].map(({ value, label, icon: Icon, desc }) => (
                    <button key={value} onClick={() => setTheme(value as any)} style={{
                      padding: '16px 20px', borderRadius: 10, border: `2px solid ${theme === value ? 'var(--accent)' : 'var(--border)'}`,
                      background: theme === value ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
                      cursor: 'pointer', transition: 'all var(--transition)', textAlign: 'left',
                    }}>
                      <Icon size={20} color={theme === value ? 'var(--accent-light)' : 'var(--text-muted)'} />
                      <div style={{ fontSize: 13, fontWeight: 700, color: theme === value ? 'var(--accent-light)' : 'var(--text-primary)', marginTop: 8 }}>{label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="glass" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Notification Settings</h3>
              <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--amber)', marginBottom: 4 }}>⚠ Email Setup Required</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  To enable email notifications, add the following to your <code style={{ background: 'var(--bg-secondary)', padding: '1px 5px', borderRadius: 3 }}>.env.local</code> file:
                  <br /><br />
                  <code style={{ background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: 6, display: 'block', fontSize: 12, fontFamily: 'monospace' }}>
                    RESEND_API_KEY=re_your_key_here<br />
                    EMAIL_FROM=noreply@yourdomain.com
                  </code>
                  <br />
                  Get your API key at <strong>resend.com</strong>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Daily Summary Email', desc: 'Receive a daily digest of habits and tasks', key: 'daily_summary' },
                  { label: 'Habit Reminders', desc: 'Get notified when it\'s time for your habits', key: 'habit_reminders' },
                  { label: 'Deadline Alerts', desc: 'Be reminded when deadlines are approaching', key: 'deadline_reminders' },
                  { label: 'Weekly Review Email', desc: 'Weekly performance summary every Monday', key: 'weekly_review' },
                ].map(({ label, desc }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</div>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                      <span style={{
                        position: 'absolute', inset: 0, background: 'var(--accent)', borderRadius: 999,
                        transition: 'background 0.2s',
                        display: 'flex', alignItems: 'center', padding: '2px',
                      }}>
                        <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', marginLeft: 'auto' }} />
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="glass" style={{ padding: 28 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Export Data</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                  Download all your goals, habits, tasks, and logs.
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={handleExportJSON} className="btn btn-secondary" style={{ gap: 8 }}>
                    <Download size={16} /> Export as JSON
                  </button>
                  <button onClick={handleExportCSV} className="btn btn-secondary" style={{ gap: 8 }}>
                    <Download size={16} /> Export as CSV
                  </button>
                </div>
              </div>

              <div className="glass" style={{ padding: 28 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Data Summary</h3>
                <div className="card-grid card-grid-3">
                  {[
                    { label: 'Goals', value: goals.length },
                    { label: 'Habits', value: habits.length },
                    { label: 'Tasks', value: tasks.length },
                    { label: 'Habit Logs', value: habitLogs.length },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ padding: '12px 14px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-light)' }}>{value}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass" style={{ padding: 28 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--rose)' }}>Danger Zone</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                  Irreversible actions. Proceed with caution.
                </p>
                <button
                  onClick={() => {
                    if (window.confirm('Clear all local data? This cannot be undone.')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="btn btn-danger"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
