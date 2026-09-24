'use client';
import { Bell, CheckCheck, Trash2, Target, CheckCircle2, Star, AlertTriangle, Calendar } from 'lucide-react';
import { useAppStore } from '@/store';
import { formatDate } from '@/lib/date';
import toast from 'react-hot-toast';
import type { Notification } from '@/types';

const TYPE_CONFIG: Record<Notification['type'], { icon: string; color: string; bg: string }> = {
  habit_reminder: { icon: '✓', color: 'var(--emerald)', bg: 'rgba(16,185,129,0.1)' },
  deadline: { icon: '⚠', color: 'var(--rose)', bg: 'rgba(244,63,94,0.1)' },
  weekly_review: { icon: '📊', color: 'var(--indigo)', bg: 'rgba(99,102,241,0.1)' },
  system: { icon: '⚡', color: 'var(--amber)', bg: 'rgba(245,158,11,0.1)' },
  milestone: { icon: '🏁', color: 'var(--accent-light)', bg: 'var(--accent-glow)' },
};

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead, deleteNotification } = useAppStore();

  const unread = notifications.filter(n => !n.is_read);
  const read = notifications.filter(n => n.is_read);

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    toast.success('All notifications marked as read');
  };

  const NotifItem = ({ notif }: { notif: Notification }) => {
    const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system;
    return (
      <div
        style={{
          display: 'flex', gap: 14, padding: '16px 20px',
          background: notif.is_read ? 'transparent' : 'var(--accent-glow)',
          borderLeft: `3px solid ${notif.is_read ? 'transparent' : config.color}`,
          borderBottom: '1px solid var(--border)',
          transition: 'all var(--transition)',
          cursor: notif.is_read ? 'default' : 'pointer',
        }}
        onClick={() => !notif.is_read && markNotificationRead(notif.id)}
      >
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: config.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
        }}>
          {config.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
            <div style={{ fontSize: 14, fontWeight: notif.is_read ? 500 : 700, color: 'var(--text-primary)', flex: 1 }}>
              {notif.title}
            </div>
            {!notif.is_read && (
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: config.color, flexShrink: 0, marginTop: 4 }} />
            )}
          </div>
          {notif.body && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 6 }}>
              {notif.body}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {new Date(notif.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); toast.success('Deleted'); }}
              className="btn btn-ghost btn-icon btn-sm"
              aria-label="Delete notification"
            >
              <Trash2 size={13} color="var(--text-muted)" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Notifications</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {unread.length} unread · {notifications.length} total
          </p>
        </div>
        {unread.length > 0 && (
          <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="glass" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>All quiet!</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>No notifications yet. Keep up your habits!</div>
        </div>
      ) : (
        <div className="glass" style={{ overflow: 'hidden' }}>
          {unread.length > 0 && (
            <>
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Unread ({unread.length})
              </div>
              {unread.map(n => <NotifItem key={n.id} notif={n} />)}
            </>
          )}
          {read.length > 0 && (
            <>
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', borderTop: unread.length > 0 ? '1px solid var(--border)' : 'none', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Earlier ({read.length})
              </div>
              {read.map(n => <NotifItem key={n.id} notif={n} />)}
            </>
          )}
        </div>
      )}

      {/* Email notification notice */}
      <div style={{ marginTop: 20, padding: '14px 18px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Bell size={16} color="var(--amber)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Email Notifications</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Email delivery requires a <code style={{ background: 'var(--bg-secondary)', padding: '1px 5px', borderRadius: 3 }}>RESEND_API_KEY</code> environment variable. Configure it in <strong>Settings → Notifications</strong> to receive email reminders and daily summaries.
          </div>
        </div>
      </div>
    </div>
  );
}
