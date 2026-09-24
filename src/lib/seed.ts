import type { Goal, Habit, HabitLog, Task, Notification, Milestone, DailyReview, WeeklyReview } from '@/types';

const today = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];
const daysAgo = (n: number) => { const d = new Date(today); d.setDate(d.getDate() - n); return fmt(d); };
const daysLater = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return fmt(d); };
const monthsLater = (n: number) => { const d = new Date(today); d.setMonth(d.getMonth() + n); return fmt(d); };

export const DEMO_USER = {
  id: 'demo-user-001',
  full_name: 'Apurva',
  timezone: 'Asia/Kolkata',
  theme: 'dark' as const,
  created_at: daysAgo(90),
};

export const DEMO_GOALS: Goal[] = [
  {
    id: 'goal-1',
    user_id: 'demo-user-001',
    title: 'Save ₹1,00,000',
    description: 'Build an emergency fund by the end of the year',
    category_id: 'cat-finance',
    start_date: daysAgo(60),
    target_date: daysLater(98),
    current_value: 32000,
    target_value: 100000,
    unit: '₹',
    priority: 'high',
    status: 'active',
    notes: 'Auto-transfer ₹10,000 on 1st of every month',
    created_at: daysAgo(60),
    updated_at: daysAgo(2),
  },
  {
    id: 'goal-2',
    user_id: 'demo-user-001',
    title: 'Learn Full-Stack Development',
    description: 'Master React, Node.js, and databases',
    category_id: 'cat-learning',
    start_date: daysAgo(45),
    target_date: monthsLater(4),
    current_value: 38,
    target_value: 100,
    unit: '%',
    priority: 'critical',
    status: 'active',
    notes: 'Focus on building real projects',
    created_at: daysAgo(45),
    updated_at: daysAgo(1),
  },
  {
    id: 'goal-3',
    user_id: 'demo-user-001',
    title: 'Read 12 Books',
    description: 'One book per month this year',
    category_id: 'cat-personal',
    start_date: daysAgo(270),
    target_date: daysLater(95),
    current_value: 7,
    target_value: 12,
    unit: 'books',
    priority: 'medium',
    status: 'active',
    notes: 'Mix of fiction and non-fiction',
    created_at: daysAgo(270),
    updated_at: daysAgo(5),
  },
  {
    id: 'goal-4',
    user_id: 'demo-user-001',
    title: 'Build Personal Portfolio',
    description: 'Create a stunning portfolio website to showcase projects',
    category_id: 'cat-career',
    start_date: daysAgo(30),
    target_date: daysLater(20),
    current_value: 65,
    target_value: 100,
    unit: '%',
    priority: 'high',
    status: 'active',
    notes: 'Must have live projects, about page, and contact form',
    created_at: daysAgo(30),
    updated_at: daysAgo(1),
  },
  {
    id: 'goal-5',
    user_id: 'demo-user-001',
    title: 'Get Fit — Lose 8 kg',
    description: 'Consistent workout and diet tracking',
    category_id: 'cat-health',
    start_date: daysAgo(30),
    target_date: monthsLater(3),
    current_value: 2.5,
    target_value: 8,
    unit: 'kg',
    priority: 'high',
    status: 'active',
    created_at: daysAgo(30),
    updated_at: daysAgo(1),
  },
];

export const DEMO_MILESTONES: Milestone[] = [
  { id: 'ms-1', goal_id: 'goal-2', user_id: 'demo-user-001', title: 'HTML & CSS Mastery', status: 'completed', sort_order: 0, current_value: 100, target_value: 100, target_date: daysAgo(35), created_at: daysAgo(45), updated_at: daysAgo(35) },
  { id: 'ms-2', goal_id: 'goal-2', user_id: 'demo-user-001', title: 'JavaScript Fundamentals', status: 'completed', sort_order: 1, current_value: 100, target_value: 100, target_date: daysAgo(20), created_at: daysAgo(45), updated_at: daysAgo(20) },
  { id: 'ms-3', goal_id: 'goal-2', user_id: 'demo-user-001', title: 'React & TypeScript', status: 'in_progress', sort_order: 2, current_value: 60, target_value: 100, target_date: daysLater(15), created_at: daysAgo(45), updated_at: daysAgo(1) },
  { id: 'ms-4', goal_id: 'goal-2', user_id: 'demo-user-001', title: 'Node.js & APIs', status: 'pending', sort_order: 3, current_value: 0, target_value: 100, target_date: daysLater(35), created_at: daysAgo(45), updated_at: daysAgo(45) },
  { id: 'ms-5', goal_id: 'goal-2', user_id: 'demo-user-001', title: 'Databases & Deployment', status: 'pending', sort_order: 4, current_value: 0, target_value: 100, target_date: monthsLater(3), created_at: daysAgo(45), updated_at: daysAgo(45) },
  { id: 'ms-6', goal_id: 'goal-4', user_id: 'demo-user-001', title: 'Design & Wireframes', status: 'completed', sort_order: 0, current_value: 1, target_value: 1, target_date: daysAgo(20), created_at: daysAgo(30), updated_at: daysAgo(20) },
  { id: 'ms-7', goal_id: 'goal-4', user_id: 'demo-user-001', title: 'Homepage & About', status: 'in_progress', sort_order: 1, current_value: 70, target_value: 100, target_date: daysLater(5), created_at: daysAgo(30), updated_at: daysAgo(1) },
  { id: 'ms-8', goal_id: 'goal-4', user_id: 'demo-user-001', title: 'Projects Section', status: 'pending', sort_order: 2, current_value: 0, target_value: 100, target_date: daysLater(12), created_at: daysAgo(30), updated_at: daysAgo(30) },
  { id: 'ms-9', goal_id: 'goal-4', user_id: 'demo-user-001', title: 'Deploy & Launch', status: 'pending', sort_order: 3, current_value: 0, target_value: 100, target_date: daysLater(20), created_at: daysAgo(30), updated_at: daysAgo(30) },
];

export const DEMO_HABITS: Habit[] = [
  { id: 'habit-1', user_id: 'demo-user-001', goal_id: 'goal-5', title: 'Workout', description: 'Gym or home workout session', icon: '💪', frequency: 'custom', frequency_days: [1, 2, 3, 4, 5], target_value: 1, unit: 'session', start_date: daysAgo(60), is_active: true, created_at: daysAgo(60), updated_at: daysAgo(1) },
  { id: 'habit-2', user_id: 'demo-user-001', title: 'Read 20 Minutes', description: 'Daily reading habit', icon: '📚', goal_id: 'goal-3', frequency: 'daily', target_value: 20, unit: 'min', start_date: daysAgo(60), is_active: true, created_at: daysAgo(60), updated_at: daysAgo(1) },
  { id: 'habit-3', user_id: 'demo-user-001', title: 'Drink 3L Water', icon: '💧', frequency: 'daily', target_value: 3, unit: 'liters', start_date: daysAgo(30), is_active: true, created_at: daysAgo(30), updated_at: daysAgo(1) },
  { id: 'habit-4', user_id: 'demo-user-001', goal_id: 'goal-2', title: 'Code for 1 Hour', description: 'Practice coding or work on projects', icon: '💻', frequency: 'daily', target_value: 60, unit: 'min', start_date: daysAgo(45), is_active: true, created_at: daysAgo(45), updated_at: daysAgo(1) },
  { id: 'habit-5', user_id: 'demo-user-001', title: 'Sleep Before 11 PM', icon: '🛌', frequency: 'daily', target_value: 1, unit: 'night', start_date: daysAgo(20), is_active: true, reminder_time: '22:30', created_at: daysAgo(20), updated_at: daysAgo(1) },
  { id: 'habit-6', user_id: 'demo-user-001', title: 'Meditate 10 Minutes', icon: '🧘', frequency: 'daily', target_value: 10, unit: 'min', start_date: daysAgo(15), is_active: true, reminder_time: '07:00', created_at: daysAgo(15), updated_at: daysAgo(1) },
];

// Generate realistic habit logs
function generateLogs(habitId: string, userId: string, daysBack: number, rate = 0.75): HabitLog[] {
  const logs: HabitLog[] = [];
  for (let i = daysBack; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const rand = Math.random();
    const status: HabitLog['status'] = rand < rate ? 'completed' : rand < rate + 0.1 ? 'skipped' : 'missed';
    logs.push({ id: `log-${habitId}-${i}`, habit_id: habitId, user_id: userId, log_date: dateStr, status, value: status === 'completed' ? 1 : 0, created_at: dateStr });
  }
  return logs;
}

export const DEMO_HABIT_LOGS: HabitLog[] = [
  ...generateLogs('habit-1', 'demo-user-001', 60, 0.80),
  ...generateLogs('habit-2', 'demo-user-001', 60, 0.70),
  ...generateLogs('habit-3', 'demo-user-001', 30, 0.65),
  ...generateLogs('habit-4', 'demo-user-001', 45, 0.75),
  ...generateLogs('habit-5', 'demo-user-001', 20, 0.60),
  ...generateLogs('habit-6', 'demo-user-001', 15, 0.85),
];

export const DEMO_TASKS: Task[] = [
  { id: 'task-1', user_id: 'demo-user-001', goal_id: 'goal-4', title: 'Complete Portfolio Homepage', description: 'Finalize hero, about, and skills sections', due_date: daysLater(3), priority: 'critical', status: 'in_progress', is_recurring: false, created_at: daysAgo(5), updated_at: daysAgo(1) },
  { id: 'task-2', user_id: 'demo-user-001', goal_id: 'goal-4', title: 'Buy Domain Name', due_date: daysLater(5), priority: 'high', status: 'todo', is_recurring: false, created_at: daysAgo(3), updated_at: daysAgo(3) },
  { id: 'task-3', user_id: 'demo-user-001', goal_id: 'goal-2', title: 'Finish React Module', description: 'Complete hooks and context chapters', due_date: daysLater(7), priority: 'high', status: 'in_progress', is_recurring: false, created_at: daysAgo(10), updated_at: daysAgo(1) },
  { id: 'task-4', user_id: 'demo-user-001', goal_id: 'goal-1', title: 'Review Monthly Finances', description: 'Track savings and adjust budget', due_date: daysLater(6), priority: 'medium', status: 'todo', is_recurring: true, recurrence_rule: 'MONTHLY', created_at: daysAgo(1), updated_at: daysAgo(1) },
  { id: 'task-5', user_id: 'demo-user-001', title: 'Buy Gym Membership', due_date: daysLater(2), priority: 'medium', status: 'todo', is_recurring: false, created_at: daysAgo(2), updated_at: daysAgo(2) },
  { id: 'task-6', user_id: 'demo-user-001', goal_id: 'goal-2', title: 'Build Todo App Project', description: 'Apply React and TypeScript skills', due_date: daysLater(10), priority: 'medium', status: 'todo', is_recurring: false, created_at: daysAgo(1), updated_at: daysAgo(1) },
  { id: 'task-7', user_id: 'demo-user-001', title: 'Update Resume', due_date: daysLater(12), priority: 'high', status: 'todo', is_recurring: false, created_at: daysAgo(5), updated_at: daysAgo(5) },
  { id: 'task-8', user_id: 'demo-user-001', title: 'Weekly Grocery Shopping', due_date: daysLater(1), priority: 'low', status: 'todo', is_recurring: true, recurrence_rule: 'WEEKLY', created_at: daysAgo(7), updated_at: daysAgo(7) },
];

export const DEMO_NOTIFICATIONS: Notification[] = [
  { id: 'notif-1', user_id: 'demo-user-001', type: 'deadline', title: 'Goal deadline approaching', body: '"Build Personal Portfolio" is due in 20 days. You\'re 65% complete.', reference_id: 'goal-4', reference_type: 'goal', is_read: false, created_at: daysAgo(0) },
  { id: 'notif-2', user_id: 'demo-user-001', type: 'habit_reminder', title: 'Don\'t forget to meditate', body: 'Your daily meditation habit is scheduled for 7:00 AM', reference_id: 'habit-6', reference_type: 'habit', is_read: false, created_at: daysAgo(0) },
  { id: 'notif-3', user_id: 'demo-user-001', type: 'milestone', title: 'Milestone completed! 🎉', body: '"JavaScript Fundamentals" milestone marked as complete.', reference_id: 'ms-2', reference_type: 'milestone', is_read: false, created_at: daysAgo(1) },
  { id: 'notif-4', user_id: 'demo-user-001', type: 'weekly_review', title: 'Weekly Review Ready', body: 'Your weekly review for last week is ready. Check your progress!', is_read: true, created_at: daysAgo(2) },
  { id: 'notif-5', user_id: 'demo-user-001', type: 'system', title: '🔥 12-day streak!', body: 'You\'ve maintained your coding habit for 12 days in a row. Keep it up!', is_read: true, created_at: daysAgo(3) },
];

export const DEMO_REVIEWS: { daily: DailyReview[]; weekly: WeeklyReview[] } = {
  daily: [
    { id: 'dr-1', user_id: 'demo-user-001', review_date: daysAgo(1), completed_habits: 4, missed_habits: 2, completed_tasks: 3, missed_tasks: 1, reflection: 'Good progress on the portfolio. Missed workout due to late meeting.', tomorrow_focus: 'Complete portfolio homepage and workout in the morning', mood: 4, created_at: daysAgo(1) },
    { id: 'dr-2', user_id: 'demo-user-001', review_date: daysAgo(2), completed_habits: 5, missed_habits: 1, completed_tasks: 4, missed_tasks: 0, reflection: 'Productive day! All tasks done.', tomorrow_focus: 'Start the projects section', mood: 5, created_at: daysAgo(2) },
  ],
  weekly: [
    {
      id: 'wr-1', user_id: 'demo-user-001',
      week_start: daysAgo(7), week_end: daysAgo(1),
      habit_completion_pct: 82, task_completion_pct: 74,
      milestones_completed: 1, best_streak: 8, missed_habits: 4,
      notes: 'Great week overall. Need to improve sleep habits.', created_at: daysAgo(1),
    },
  ],
};
