export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  timezone: string;
  theme: 'light' | 'dark' | 'system';
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon?: string;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category_id?: string;
  category?: Category;
  start_date: string;
  target_date: string;
  current_value: number;
  target_value: number;
  unit?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  notes?: string;
  milestones?: Milestone[];
  habits?: Habit[];
  tasks?: Task[];
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  goal_id: string;
  user_id: string;
  title: string;
  description?: string;
  target_date?: string;
  current_value: number;
  target_value?: number;
  status: 'pending' | 'in_progress' | 'completed';
  notes?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  goal_id?: string;
  title: string;
  description?: string;
  icon?: string;
  category_id?: string;
  category?: Category;
  frequency: 'daily' | 'weekly' | 'custom';
  frequency_days?: number[];
  target_value: number;
  unit?: string;
  start_date: string;
  end_date?: string;
  reminder_time?: string;
  is_active: boolean;
  notes?: string;
  logs?: HabitLog[];
  streak?: StreakData;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  log_date: string;
  status: 'completed' | 'skipped' | 'missed';
  value: number;
  notes?: string;
  created_at: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  weeklyCompletion: number;
  monthlyCompletion: number;
  totalCompletions: number;
}

export interface Task {
  id: string;
  user_id: string;
  goal_id?: string;
  habit_id?: string;
  title: string;
  description?: string;
  due_date?: string;
  due_time?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'in_progress' | 'completed' | 'overdue';
  is_recurring: boolean;
  recurrence_rule?: string;
  tags?: string[];
  reminder_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'habit_reminder' | 'deadline' | 'weekly_review' | 'system' | 'milestone';
  title: string;
  body?: string;
  reference_id?: string;
  reference_type?: 'goal' | 'habit' | 'task' | 'milestone';
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_enabled: boolean;
  daily_summary: boolean;
  habit_reminders: boolean;
  deadline_reminders: boolean;
  weekly_review: boolean;
  reminder_time: string;
  updated_at: string;
}

export interface DailyReview {
  id: string;
  user_id: string;
  review_date: string;
  completed_habits: number;
  missed_habits: number;
  completed_tasks: number;
  missed_tasks: number;
  reflection?: string;
  tomorrow_focus?: string;
  mood?: number;
  created_at: string;
}

export interface WeeklyReview {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  habit_completion_pct: number;
  task_completion_pct: number;
  milestones_completed: number;
  best_streak: number;
  missed_habits: number;
  notes?: string;
  created_at: string;
}

export interface DaysRemainingInfo {
  days: number;
  label: string;
  status: 'overdue' | 'due_today' | 'due_tomorrow' | 'upcoming' | 'far';
  percentTimeElapsed: number;
}

export interface GoalHealth {
  status: 'on_track' | 'needs_attention' | 'behind';
  percentProgress: number;
  percentTimeElapsed: number;
}

export interface SearchResult {
  id: string;
  type: 'goal' | 'habit' | 'task' | 'milestone';
  title: string;
  subtitle?: string;
  href: string;
}

export interface AnalyticsData {
  habitCompletion: { date: string; completed: number; total: number }[];
  goalProgress: { title: string; progress: number; status: string }[];
  streakData: { habit: string; streak: number }[];
  taskCompletion: { week: string; completed: number; total: number }[];
  kpis: {
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    avgCompletion: number;
    currentStreak: number;
    longestStreak: number;
    tasksCompleted: number;
    tasksOverdue: number;
  };
}
