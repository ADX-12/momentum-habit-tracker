import { differenceInDays, parseISO, isToday, isTomorrow, isPast, startOfDay } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import type { DaysRemainingInfo, GoalHealth, HabitLog, StreakData } from '@/types';

export const DEFAULT_TZ = 'Asia/Kolkata';

export function nowInTZ(tz = DEFAULT_TZ) {
  return toZonedTime(new Date(), tz);
}

export function todayInTZ(tz = DEFAULT_TZ): Date {
  return startOfDay(toZonedTime(new Date(), tz));
}

export function getDaysRemaining(targetDate: string): DaysRemainingInfo {
  const today = startOfDay(new Date());
  const target = startOfDay(parseISO(targetDate));
  const days = differenceInDays(target, today);

  let label: string;
  let status: DaysRemainingInfo['status'];

  if (days < 0) {
    label = `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`;
    status = 'overdue';
  } else if (days === 0) {
    label = 'Due Today';
    status = 'due_today';
  } else if (days === 1) {
    label = 'Due Tomorrow';
    status = 'due_tomorrow';
  } else if (days <= 7) {
    label = `${days} Days Remaining`;
    status = 'upcoming';
  } else {
    label = `${days} Days Remaining`;
    status = 'far';
  }

  return { days, label, status, percentTimeElapsed: 0 };
}

export function getDaysRemainingWithStart(startDate: string, targetDate: string): DaysRemainingInfo {
  const info = getDaysRemaining(targetDate);
  const today = startOfDay(new Date());
  const start = startOfDay(parseISO(startDate));
  const target = startOfDay(parseISO(targetDate));

  const totalDays = differenceInDays(target, start);
  const elapsed = differenceInDays(today, start);
  const percentTimeElapsed = totalDays > 0 ? Math.min(100, Math.max(0, (elapsed / totalDays) * 100)) : 0;

  return { ...info, percentTimeElapsed };
}

export function getGoalHealth(
  startDate: string,
  targetDate: string,
  currentValue: number,
  targetValue: number
): GoalHealth {
  const { percentTimeElapsed } = getDaysRemainingWithStart(startDate, targetDate);
  const percentProgress = targetValue > 0 ? Math.min(100, (currentValue / targetValue) * 100) : 0;

  let status: GoalHealth['status'];
  const diff = percentProgress - percentTimeElapsed;

  if (diff >= -5) {
    status = 'on_track';
  } else if (diff >= -20) {
    status = 'needs_attention';
  } else {
    status = 'behind';
  }

  return { status, percentProgress, percentTimeElapsed };
}

export function calculateStreak(logs: HabitLog[], today: Date = new Date()): StreakData {
  const completedDates = new Set(
    logs.filter(l => l.status === 'completed').map(l => l.log_date)
  );

  // Current streak
  let currentStreak = 0;
  const checkDate = startOfDay(today);
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (completedDates.has(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  const sortedDates = [...completedDates].sort();
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = parseISO(sortedDates[i - 1]);
      const curr = parseISO(sortedDates[i]);
      if (differenceInDays(curr, prev) === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  const totalCompletions = completedDates.size;
  const totalLogs = logs.length;
  const completionRate = totalLogs > 0 ? (totalCompletions / totalLogs) * 100 : 0;

  // Weekly completion (last 7 days)
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyLogs = logs.filter(l => parseISO(l.log_date) >= weekAgo);
  const weeklyCompleted = weeklyLogs.filter(l => l.status === 'completed').length;
  const weeklyCompletion = weeklyLogs.length > 0 ? (weeklyCompleted / weeklyLogs.length) * 100 : 0;

  // Monthly completion (last 30 days)
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);
  const monthlyLogs = logs.filter(l => parseISO(l.log_date) >= monthAgo);
  const monthlyCompleted = monthlyLogs.filter(l => l.status === 'completed').length;
  const monthlyCompletion = monthlyLogs.length > 0 ? (monthlyCompleted / monthlyLogs.length) * 100 : 0;

  return {
    currentStreak,
    longestStreak,
    completionRate,
    weeklyCompletion,
    monthlyCompletion,
    totalCompletions,
  };
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatCurrency(value: number, currency = '₹'): string {
  return `${currency}${value.toLocaleString('en-IN')}`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 20) return 'Good Evening';
  return 'Good Night';
}

export function getHeatmapData(logs: HabitLog[], weeksBack = 52) {
  const today = startOfDay(new Date());
  const data: { date: string; count: number; status?: string }[] = [];

  for (let i = weeksBack * 7; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const log = logs.find(l => l.log_date === dateStr);
    data.push({
      date: dateStr,
      count: log?.status === 'completed' ? 1 : 0,
      status: log?.status,
    });
  }
  return data;
}

export function getDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export function getMonthName(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
