/**
 * Email Notification Service
 *
 * Abstract interface for sending emails.
 * Concrete providers (Resend, SendGrid, etc.) implement the EmailProvider interface.
 *
 * Configuration:
 *   RESEND_API_KEY=re_...
 *   EMAIL_FROM=noreply@yourdomain.com
 *
 * To activate email: Uncomment the ResendProvider import and set env vars.
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailProvider {
  send(options: EmailOptions): Promise<{ success: boolean; error?: string }>;
}

// ---- Null provider (no-op, for when no email is configured) ----
class NullEmailProvider implements EmailProvider {
  async send(options: EmailOptions) {
    console.log('[Email] No provider configured. Would send:', options.subject, 'to', options.to);
    return { success: false, error: 'No email provider configured. Set RESEND_API_KEY.' };
  }
}

// ---- Resend provider ----
class ResendEmailProvider implements EmailProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async send(options: EmailOptions) {
    try {
      const from = process.env.EMAIL_FROM || 'noreply@momentum.app';
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, to: options.to, subject: options.subject, html: options.html }),
      });
      if (!response.ok) {
        const err = await response.text();
        return { success: false, error: err };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}

// ---- Factory: returns appropriate provider based on env ----
function createEmailProvider(): EmailProvider {
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && resendKey.startsWith('re_')) {
    return new ResendEmailProvider(resendKey);
  }
  return new NullEmailProvider();
}

// ---- Notification service ----
export class NotificationService {
  private provider: EmailProvider;

  constructor() {
    this.provider = createEmailProvider();
  }

  async sendHabitReminder(to: string, habitName: string, reminderTime: string) {
    return this.provider.send({
      to,
      subject: `⏰ Habit reminder: ${habitName}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px;">
          <h1 style="color: #7c3aed; margin-bottom: 8px;">Don't forget! 🎯</h1>
          <p style="font-size: 18px; color: #1a1a2e; margin-bottom: 16px;">
            Time to complete: <strong>${habitName}</strong>
          </p>
          <p style="color: #555577;">Reminder scheduled for ${reminderTime}.</p>
          <a href="#" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; font-weight: 600;">
            Open Momentum
          </a>
        </div>
      `,
      text: `Time to complete: ${habitName}. Reminder scheduled for ${reminderTime}.`,
    });
  }

  async sendDeadlineAlert(to: string, goalTitle: string, daysRemaining: number) {
    const urgencyLabel = daysRemaining === 0 ? 'due TODAY' : daysRemaining === 1 ? 'due TOMORROW' : `due in ${daysRemaining} days`;
    return this.provider.send({
      to,
      subject: `🚨 Deadline approaching: ${goalTitle}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px;">
          <h1 style="color: #f43f5e; margin-bottom: 8px;">Deadline Approaching ⚠️</h1>
          <p style="font-size: 18px; color: #1a1a2e; margin-bottom: 8px;">
            <strong>${goalTitle}</strong> is ${urgencyLabel}.
          </p>
          <p style="color: #555577;">Stay focused and keep pushing!</p>
          <a href="#" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; font-weight: 600;">
            View Goal
          </a>
        </div>
      `,
      text: `${goalTitle} is ${urgencyLabel}.`,
    });
  }

  async sendDailySummary(to: string, summary: {
    habitsCompleted: number; habitsTotal: number;
    tasksCompleted: number; tasksTotal: number;
    upcomingDeadlines: number;
    userName: string;
  }) {
    return this.provider.send({
      to,
      subject: `📊 Your Daily Summary — ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px;">
          <h1 style="color: #7c3aed;">Your Daily Summary, ${summary.userName} 👋</h1>
          <div style="background: #f5f5fc; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <div style="margin-bottom: 12px;">
              <strong>Habits:</strong> ${summary.habitsCompleted}/${summary.habitsTotal} completed
              <div style="background: #e8e8f4; border-radius: 999px; height: 8px; margin-top: 6px;">
                <div style="background: #10b981; height: 8px; border-radius: 999px; width: ${Math.round((summary.habitsCompleted/summary.habitsTotal)*100)||0}%"></div>
              </div>
            </div>
            <div style="margin-bottom: 12px;">
              <strong>Tasks:</strong> ${summary.tasksCompleted}/${summary.tasksTotal} completed
            </div>
            <div>
              <strong>Upcoming deadlines:</strong> ${summary.upcomingDeadlines}
            </div>
          </div>
          <a href="#" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Open Momentum
          </a>
        </div>
      `,
    });
  }
}

// Singleton
export const notificationService = new NotificationService();
