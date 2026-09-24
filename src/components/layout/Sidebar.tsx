'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Target, CheckCircle2, ClipboardList, Calendar,
  GitBranch, BarChart3, Bell, BookOpen, Settings, Flame, ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAppStore } from '@/store';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/habits', label: 'Habits', icon: CheckCircle2 },
  { href: '/tasks', label: 'Tasks', icon: ClipboardList },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/timeline', label: 'Timeline', icon: GitBranch },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/reviews', label: 'Reviews', icon: BookOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { notifications, habits, habitLogs, isSidebarCollapsed, toggleSidebar } = useAppStore();
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Calculate today's streak across all habits
  const today = new Date().toISOString().split('T')[0];
  const todayCompleted = habitLogs.filter(l => l.log_date === today && l.status === 'completed').length;
  const todayTotal = habits.filter(h => h.is_active).length;

  return (
    <aside
      className="sidebar"
      style={{ width: isSidebarCollapsed ? '64px' : 'var(--sidebar-width)', transition: 'width 200ms ease' }}
    >
      {/* Logo */}
      <div style={{
        padding: isSidebarCollapsed ? '20px 12px' : '20px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
        gap: 8,
      }}>
        {!isSidebarCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, flexShrink: 0,
            }}>⚡</div>
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>Momentum</span>
          </div>
        )}
        {isSidebarCollapsed && (
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>⚡</div>
        )}
        <button
          onClick={toggleSidebar}
          className="btn btn-ghost btn-icon"
          style={{ flexShrink: 0 }}
          aria-label="Toggle sidebar"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Today's quick stats */}
      {!isSidebarCollapsed && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{
            background: 'var(--accent-glow)',
            border: '1px solid rgba(124, 58, 237, 0.2)',
            borderRadius: 8,
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span className="streak-fire" style={{ fontSize: 18 }}>🔥</span>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>TODAY</div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>
                {todayCompleted} / {todayTotal} habits
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ padding: '12px 8px', flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const hasNotif = item.href === '/notifications' && unreadCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('nav-item', isActive && 'active')}
              title={isSidebarCollapsed ? item.label : undefined}
              style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start' }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Icon size={18} />
                {hasNotif && (
                  <span className="pulse-dot" style={{
                    position: 'absolute', top: -3, right: -3,
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--rose)',
                  }} />
                )}
              </div>
              {!isSidebarCollapsed && (
                <>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {hasNotif && (
                    <span style={{
                      background: 'var(--rose)', color: 'white',
                      fontSize: 10, fontWeight: 700, minWidth: 18, height: 18,
                      borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '0 4px',
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      {!isSidebarCollapsed && (
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0,
          }}>A</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Apurva</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Personal</div>
          </div>
        </div>
      )}
    </aside>
  );
}
