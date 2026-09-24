'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, Sun, Moon, Monitor, Bell, Command, X } from 'lucide-react';
import { useAppStore } from '@/store';
import { getGreeting } from '@/lib/date';
import Link from 'next/link';
import type { SearchResult } from '@/types';

export function TopBar() {
  const { theme, setTheme, notifications, goals, habits, tasks, setSearchOpen } = useAppStore();
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now.toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }));
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setSearchOpen]);

  const cycleTheme = () => {
    const themes: ('dark' | 'light' | 'system')[] = ['dark', 'light', 'system'];
    const idx = themes.indexOf(theme);
    setTheme(themes[(idx + 1) % themes.length]);
  };

  const ThemeIcon = theme === 'light' ? Sun : theme === 'system' ? Monitor : Moon;

  return (
    <header className="topbar" style={{ display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16 }}>
      {/* Date */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{currentDate}</div>
      </div>

      {/* Search button */}
      <button
        onClick={() => setSearchOpen(true)}
        className="btn btn-secondary"
        style={{ gap: 8, minWidth: 200, justifyContent: 'space-between', opacity: 0.8 }}
        aria-label="Open search"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Search size={14} />
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Search anything...</span>
        </div>
        <kbd style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border)',
          borderRadius: 4,
          padding: '2px 6px',
          fontSize: 11,
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}>
          <Command size={10} /> K
        </kbd>
      </button>

      {/* Theme toggle */}
      <button
        onClick={cycleTheme}
        className="btn btn-ghost btn-icon"
        title={`Theme: ${theme}`}
        aria-label="Toggle theme"
      >
        <ThemeIcon size={18} />
      </button>

      {/* Notifications */}
      <Link href="/notifications" style={{ position: 'relative' }} aria-label="Notifications">
        <button className="btn btn-ghost btn-icon">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="pulse-dot" style={{
              position: 'absolute', top: 4, right: 4,
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--rose)',
            }} />
          )}
        </button>
      </Link>
    </header>
  );
}
