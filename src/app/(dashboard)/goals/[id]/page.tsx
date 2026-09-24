import GoalDetailView from './GoalDetailView';
import { DEMO_GOALS } from '@/lib/seed';

export function generateStaticParams() {
  return DEMO_GOALS.map((goal) => ({
    id: goal.id,
  }));
}

export default async function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GoalDetailView id={id} />;
}
