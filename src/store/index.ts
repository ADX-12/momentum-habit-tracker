'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Goal, Habit, HabitLog, Task, Notification, Milestone, DailyReview, WeeklyReview } from '@/types';

export const DEFAULT_USER = {
  id: 'user-001',
  full_name: 'User',
  timezone: 'Asia/Kolkata',
  theme: 'dark' as const,
  created_at: new Date().toISOString(),
};

interface AppState {
  // Theme
  theme: 'dark' | 'light' | 'system';
  setTheme: (t: 'dark' | 'light' | 'system') => void;

  // User
  user: typeof DEFAULT_USER;
  setUser: (u: Partial<typeof DEFAULT_USER>) => void;

  // Goals
  goals: Goal[];
  addGoal: (g: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  updateGoal: (id: string, g: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  // Milestones
  milestones: Milestone[];
  addMilestone: (m: Omit<Milestone, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  updateMilestone: (id: string, m: Partial<Milestone>) => void;
  deleteMilestone: (id: string) => void;

  // Habits
  habits: Habit[];
  addHabit: (h: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  updateHabit: (id: string, h: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;

  // Habit Logs
  habitLogs: HabitLog[];
  logHabit: (habitId: string, date: string, status: HabitLog['status']) => void;

  // Tasks
  tasks: Task[];
  addTask: (t: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  updateTask: (id: string, t: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;

  // Notifications
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;

  // Reviews
  dailyReviews: DailyReview[];
  weeklyReviews: WeeklyReview[];
  addDailyReview: (r: Omit<DailyReview, 'id' | 'user_id' | 'created_at'>) => void;
  deleteDailyReview: (id: string) => void;
  addWeeklyReview: (r: Omit<WeeklyReview, 'id' | 'user_id' | 'created_at'>) => void;
  deleteWeeklyReview: (id: string) => void;

  // Reset / Clear
  resetToCleanState: () => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchOpen: boolean;
  setSearchOpen: (v: boolean) => void;

  // Sidebar
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const genId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);
const now = () => new Date().toISOString();

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      setTheme: (t) => set({ theme: t }),

      user: DEFAULT_USER,
      setUser: (u) => set((s) => ({ user: { ...s.user, ...u } })),

      goals: [],
      addGoal: (g) => set((s) => ({
        goals: [...s.goals, { ...g, id: genId(), user_id: s.user.id, created_at: now(), updated_at: now() }],
      })),
      updateGoal: (id, g) => set((s) => ({
        goals: s.goals.map(goal => goal.id === id ? { ...goal, ...g, updated_at: now() } : goal),
      })),
      deleteGoal: (id) => set((s) => ({
        goals: s.goals.filter(g => g.id !== id),
        milestones: s.milestones.filter(m => m.goal_id !== id),
        habits: s.habits.filter(h => h.goal_id !== id),
        tasks: s.tasks.filter(t => t.goal_id !== id),
      })),

      milestones: [],
      addMilestone: (m) => set((s) => ({
        milestones: [...s.milestones, { ...m, id: genId(), user_id: s.user.id, created_at: now(), updated_at: now() }],
      })),
      updateMilestone: (id, m) => set((s) => ({
        milestones: s.milestones.map(ms => ms.id === id ? { ...ms, ...m, updated_at: now() } : ms),
      })),
      deleteMilestone: (id) => set((s) => ({ milestones: s.milestones.filter(m => m.id !== id) })),

      habits: [],
      addHabit: (h) => set((s) => ({
        habits: [...s.habits, { ...h, id: genId(), user_id: s.user.id, created_at: now(), updated_at: now() }],
      })),
      updateHabit: (id, h) => set((s) => ({
        habits: s.habits.map(habit => habit.id === id ? { ...habit, ...h, updated_at: now() } : habit),
      })),
      deleteHabit: (id) => set((s) => ({
        habits: s.habits.filter(h => h.id !== id),
        habitLogs: s.habitLogs.filter(l => l.habit_id !== id),
      })),

      habitLogs: [],
      logHabit: (habitId, date, status) => set((s) => {
        const existing = s.habitLogs.find(l => l.habit_id === habitId && l.log_date === date);
        if (existing) {
          return {
            habitLogs: s.habitLogs.map(l =>
              l.habit_id === habitId && l.log_date === date ? { ...l, status } : l
            ),
          };
        }
        return {
          habitLogs: [...s.habitLogs, {
            id: genId(),
            habit_id: habitId,
            user_id: s.user.id,
            log_date: date,
            status,
            value: status === 'completed' ? 1 : 0,
            created_at: now(),
          }],
        };
      }),

      tasks: [],
      addTask: (t) => set((s) => ({
        tasks: [...s.tasks, { ...t, id: genId(), user_id: s.user.id, created_at: now(), updated_at: now() }],
      })),
      updateTask: (id, t) => set((s) => ({
        tasks: s.tasks.map(task => task.id === id ? { ...task, ...t, updated_at: now() } : task),
      })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter(t => t.id !== id) })),
      completeTask: (id) => set((s) => ({
        tasks: s.tasks.map(t => t.id === id ? { ...t, status: 'completed', completed_at: now(), updated_at: now() } : t),
      })),

      notifications: [],
      markNotificationRead: (id) => set((s) => ({
        notifications: s.notifications.map(n => n.id === id ? { ...n, is_read: true } : n),
      })),
      markAllNotificationsRead: () => set((s) => ({
        notifications: s.notifications.map(n => ({ ...n, is_read: true })),
      })),
      deleteNotification: (id) => set((s) => ({
        notifications: s.notifications.filter(n => n.id !== id),
      })),

      dailyReviews: [],
      weeklyReviews: [],
      addDailyReview: (r) => set((s) => ({
        dailyReviews: [...s.dailyReviews.filter(d => d.review_date !== r.review_date), {
          ...r, id: genId(), user_id: s.user.id, created_at: now(),
        }],
      })),
      deleteDailyReview: (id) => set((s) => ({
        dailyReviews: s.dailyReviews.filter(d => d.id !== id),
      })),
      addWeeklyReview: (r) => set((s) => ({
        weeklyReviews: [...s.weeklyReviews.filter(w => w.week_start !== r.week_start), {
          ...r, id: genId(), user_id: s.user.id, created_at: now(),
        }],
      })),
      deleteWeeklyReview: (id) => set((s) => ({
        weeklyReviews: s.weeklyReviews.filter(w => w.id !== id),
      })),

      resetToCleanState: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('momentum-store');
          localStorage.removeItem('momentum-store-v2');
        }
        set({
          goals: [],
          milestones: [],
          habits: [],
          habitLogs: [],
          tasks: [],
          notifications: [],
          dailyReviews: [],
          weeklyReviews: [],
        });
      },

      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),
      isSearchOpen: false,
      setSearchOpen: (v) => set({ isSearchOpen: v }),

      isSidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
    }),
    {
      name: 'momentum-store-v2',
      onRehydrateStorage: () => () => {
        if (typeof window !== 'undefined') {
          // If the legacy store exists, clean it up so old dummy data is completely purged
          localStorage.removeItem('momentum-store');
        }
      },
      partialize: (state) => ({
        theme: state.theme,
        goals: state.goals,
        milestones: state.milestones,
        habits: state.habits,
        habitLogs: state.habitLogs,
        tasks: state.tasks,
        notifications: state.notifications,
        dailyReviews: state.dailyReviews,
        weeklyReviews: state.weeklyReviews,
      }),
    }
  )
);
