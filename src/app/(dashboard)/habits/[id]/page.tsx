import HabitDetailView from './HabitDetailView';

export function generateStaticParams() {
  return [{ id: 'habit-1' }];
}

export default async function HabitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <HabitDetailView id={id} />;
}
