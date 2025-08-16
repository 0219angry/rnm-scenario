'use client';
import { TimerControl } from '@/components/features/timer/TimerControl';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TimerControl sessionId={id} />;
}