'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Target, CheckCircle2, ClipboardList, Calendar, BarChart3 } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { SearchModal } from '@/components/shared/SearchModal';
import { useAppStore } from '@/store';
import { cn } from '@/utils/cn';

const MOBILE_NAV = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/habits', label: 'Habits', icon: CheckCircle2 },
  { href: '/tasks', label: 'Tasks', icon: ClipboardList },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { theme } = useAppStore();
  const pathname = usePathname();

  // Apply theme class
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('dark', 'light');
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      html.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      html.classList.add(theme);
    }
  }, [theme]);

  return (
    <>
      <div className="app-shell">
        <Sidebar />
        <TopBar />
        <main className="main-content fade-in">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="mobile-nav"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          padding: '8px 0',
          display: 'none',
          zIndex: 100,
        }}
      >
        {MOBILE_NAV.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '6px 0',
                color: isActive ? 'var(--accent-light)' : 'var(--text-muted)',
                textDecoration: 'none',
                fontSize: 10,
                fontWeight: 600,
                transition: 'color 150ms ease',
              }}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <SearchModal />
    </>
  );
}
