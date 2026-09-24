export const DEFAULT_TIMEZONE = 'Asia/Kolkata';

export const PRIORITY_COLORS = {
  low: 'text-emerald-400 bg-emerald-400/10',
  medium: 'text-amber-400 bg-amber-400/10',
  high: 'text-orange-400 bg-orange-400/10',
  critical: 'text-rose-400 bg-rose-400/10',
} as const;

export const STATUS_COLORS = {
  active: 'text-indigo-400 bg-indigo-400/10',
  completed: 'text-emerald-400 bg-emerald-400/10',
  paused: 'text-amber-400 bg-amber-400/10',
  abandoned: 'text-slate-400 bg-slate-400/10',
  todo: 'text-slate-400 bg-slate-400/10',
  in_progress: 'text-indigo-400 bg-indigo-400/10',
  overdue: 'text-rose-400 bg-rose-400/10',
  pending: 'text-amber-400 bg-amber-400/10',
  in_progress_m: 'text-indigo-400 bg-indigo-400/10',
} as const;

export const HABIT_ICONS = [
  '💧', '📚', '🏃', '💪', '🧘', '💻', '🎯', '💰', '🛌', '🥗',
  '☕', '🎵', '✍️', '🌅', '🚶', '🧠', '💊', '🫁', '🎨', '📝',
];

export const CATEGORIES = [
  { name: 'Health & Fitness', color: '#10b981', icon: '💪' },
  { name: 'Learning', color: '#6366f1', icon: '📚' },
  { name: 'Finance', color: '#f59e0b', icon: '💰' },
  { name: 'Career', color: '#3b82f6', icon: '💼' },
  { name: 'Personal', color: '#ec4899', icon: '🌟' },
  { name: 'Relationships', color: '#f97316', icon: '❤️' },
  { name: 'Mindfulness', color: '#8b5cf6', icon: '🧘' },
  { name: 'Creativity', color: '#14b8a6', icon: '🎨' },
];

export const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/goals', label: 'Goals', icon: 'Target' },
  { href: '/habits', label: 'Habits', icon: 'CheckCircle2' },
  { href: '/tasks', label: 'Tasks', icon: 'ClipboardList' },
  { href: '/calendar', label: 'Calendar', icon: 'Calendar' },
  { href: '/timeline', label: 'Timeline', icon: 'GitBranch' },
  { href: '/analytics', label: 'Analytics', icon: 'BarChart3' },
  { href: '/notifications', label: 'Notifications', icon: 'Bell' },
  { href: '/reviews', label: 'Reviews', icon: 'BookOpen' },
  { href: '/settings', label: 'Settings', icon: 'Settings' },
];
