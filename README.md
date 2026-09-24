# Momentum 🚀
> **Personal Command Center for Habits, Goals, Deadlines & Timeline Management**

Momentum is a modern, responsive, high-performance web platform built with Next.js 16, React 19, TypeScript, and TailwindCSS. Designed as an all-in-one personal accountability system, it empowers users to turn long-term vision into daily execution.

---

## ✨ Key Features

### 🎯 Goal Management
- **Target Tracking**: Track numeric goals with current vs. target metrics, units, and automatic progress calculation.
- **Milestone Breakdown**: Break multi-month goals into sequential milestones with due dates and statuses.
- **Goal Health Indicator**: Real-time algorithm flagging goals as *On Track*, *At Risk*, or *Behind* based on days remaining vs. percentage completed.
- **Categorization & Priorities**: Group by Career, Health, Finance, Learning, Personal, and filter by priority (*High*, *Medium*, *Low*).

### 🔥 Habit Tracking & Heatmaps
- **Multi-Frequency Support**: Track Daily, Weekly, and Monthly habits.
- **Consistency Heatmap**: Visual contribution-style heatmaps (similar to GitHub commits) showing daily completion density.
- **Streak & Performance Engine**: Current streaks, best streaks, and total completion percentages updated in real-time.
- **Goal Linking**: Link habits directly to parent goals so daily consistency drives long-term achievements.

### ⏳ Timeline & Milestone Gantt
- **Interactive Visual Timeline**: Horizontal timeline visualizing goals, milestones, and active deadlines.
- **Status & Urgency Coloring**: Instant visual identification of approaching deadlines and overdue milestones.

### 📅 Calendar & Tasks
- **Multi-View Calendar**: Switch between Month, Week, and Day views with deadline markers.
- **Task Management**: Filter by status (*To Do*, *In Progress*, *Completed*), priority, and due dates.

### 📊 Progress Analytics & Productivity Score
- **Productivity Scoring Algorithm**: 0–100 composite score calculated from habit completion rates and task velocity.
- **Weekly & Monthly Trends**: Interactive bar charts and area graphs powered by Recharts.
- **Completion Distributions**: Category breakdown showing where your energy is spent.

### 📝 Reviews & Reflections
- **Structured Cadence**: Dedicated Daily, Weekly, and Monthly review workflows.
- **Accountability Logging**: Record wins, challenges, lessons learned, and planning adjustments.

### 🔔 Smart Notifications & Email Service
- **In-App Notification Center**: Alert badges for overdue tasks, approaching deadlines, and broken streaks.
- **Email Service Abstraction**: Pluggable email notification architecture ready for Resend integration.

### 🎨 Premium UI & Design System
- **Dark & Light Mode**: Seamless theme switching with semantic CSS variables and zero flash of unstyled content.
- **Global Command Menu**: ⌘K / Ctrl+K quick-search across goals, habits, and tasks.
- **Local-First Persistence**: Instant load times and offline readiness via Zustand + localStorage.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Core Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (with persistent storage)
- **Email Delivery**: [Resend SDK](https://resend.com/)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.17+ or v20+ (tested on Node v25)
- **npm**, **yarn**, or **pnpm**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ADX-12/momentum-habit-tracker.git
   cd momentum-habit-tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```
   *(Optional: Add your Resend API key in `.env.local` to enable transactional email notifications)*

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Architecture

```
habit-tracker/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── analytics/        # Productivity scoring & charts
│   │   │   ├── calendar/         # Month / Week / Day calendar
│   │   │   ├── goals/            # Goal list, creation & detail pages
│   │   │   ├── habits/           # Habit tracker, detail & heatmaps
│   │   │   ├── notifications/    # Smart notification hub
│   │   │   ├── reviews/          # Daily / Weekly / Monthly reviews
│   │   │   ├── settings/         # Theme toggle, data export & reset
│   │   │   ├── tasks/            # Task management & board
│   │   │   ├── timeline/         # Milestone Gantt & timeline
│   │   │   ├── layout.tsx        # Dashboard shell layout
│   │   │   └── page.tsx          # Main command center dashboard
│   │   ├── globals.css           # Design tokens, variables & animations
│   │   └── layout.tsx            # Root HTML & metadata
│   ├── components/
│   │   ├── layout/               # Sidebar, TopBar, AppShell
│   │   └── shared/               # SearchModal (⌘K) & shared UI
│   ├── lib/
│   │   ├── date.ts               # Date math, streaks & health algorithms
│   │   └── seed.ts               # Initial demo datasets
│   ├── services/
│   │   └── email/                # Resend email notifications service
│   ├── store/
│   │   └── index.ts              # Zustand store with persistence
│   ├── types/
│   │   └── index.ts              # Global TypeScript interfaces
│   └── utils/
│       ├── cn.ts                 # Classname utility
│       └── constants.ts          # App configuration & presets
├── package.json
└── tsconfig.json
```

---

## 📄 License

MIT License. Open source and built for personal productivity enthusiasts.
