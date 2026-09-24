'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, X, Target, CheckCircle2, ClipboardList, Milestone } from 'lucide-react';
import { useAppStore } from '@/store';
import { useRouter } from 'next/navigation';
import type { SearchResult } from '@/types';

export function SearchModal() {
  const { isSearchOpen, setSearchOpen, goals, habits, tasks, milestones } = useAppStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setSearchOpen]);

  const results: SearchResult[] = query.length < 2 ? [] : [
    ...goals
      .filter(g => g.title.toLowerCase().includes(query.toLowerCase()) || g.description?.toLowerCase().includes(query.toLowerCase()))
      .map(g => ({ id: g.id, type: 'goal' as const, title: g.title, subtitle: g.description, href: `/goals/${g.id}` })),
    ...habits
      .filter(h => h.title.toLowerCase().includes(query.toLowerCase()))
      .map(h => ({ id: h.id, type: 'habit' as const, title: h.title, subtitle: `${h.frequency} habit`, href: `/habits/${h.id}` })),
    ...tasks
      .filter(t => t.title.toLowerCase().includes(query.toLowerCase()))
      .map(t => ({ id: t.id, type: 'task' as const, title: t.title, subtitle: t.due_date ? `Due ${t.due_date}` : undefined, href: `/tasks` })),
    ...milestones
      .filter(m => m.title.toLowerCase().includes(query.toLowerCase()))
      .map(m => ({ id: m.id, type: 'milestone' as const, title: m.title, subtitle: m.status, href: `/goals/${m.goal_id}` })),
  ].slice(0, 8);

  const typeIcons = {
    goal: <Target size={14} color="var(--accent-light)" />,
    habit: <CheckCircle2 size={14} color="var(--emerald)" />,
    task: <ClipboardList size={14} color="var(--amber)" />,
    milestone: <Target size={14} color="var(--indigo)" />,
  };

  if (!isSearchOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '10vh',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
    >
      <div
        className="glass"
        style={{ width: '100%', maxWidth: 560, margin: '0 16px', overflow: 'hidden' }}
      >
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <Search size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search goals, habits, tasks..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontSize: 16, color: 'var(--text-primary)', fontFamily: 'inherit',
            }}
            aria-label="Global search"
          />
          <button onClick={() => setSearchOpen(false)} className="btn btn-ghost btn-icon btn-sm">
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {query.length < 2 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              Type at least 2 characters to search...
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              No results found for "<strong style={{ color: 'var(--text-secondary)' }}>{query}</strong>"
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: '8px' }}>
              {results.map(result => (
                <li key={result.id}>
                  <button
                    onClick={() => { router.push(result.href); setSearchOpen(false); }}
                    style={{
                      width: '100%', textAlign: 'left', padding: '12px 16px',
                      borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12,
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      transition: 'background var(--transition)',
                      color: 'var(--text-primary)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {typeIcons[result.type]}
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{result.title}</div>
                      {result.subtitle && (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{result.subtitle}</div>
                      )}
                    </div>
                    <span style={{
                      marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)',
                      background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 4,
                      textTransform: 'capitalize',
                    }}>
                      {result.type}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 20px', borderTop: '1px solid var(--border)',
          display: 'flex', gap: 16, color: 'var(--text-muted)', fontSize: 11,
        }}>
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>Esc close</span>
        </div>
      </div>
    </div>
  );
}
