import HabitDetailView from './HabitDetailView';
import { DEMO_HABITS } from '@/lib/seed';

export function generateStaticParams() {
  return DEMO_HABITS.map((habit) => ({
    id: habit.id,
  }));
}

export default async function HabitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <HabitDetailView id={id} />;
}
