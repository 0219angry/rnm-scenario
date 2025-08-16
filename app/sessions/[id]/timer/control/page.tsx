'use client';
import { useParams } from 'next/navigation';
import { TimerControl } from '@/components/features/timer/TimerControl';

export default async function Page() {
  const { id } = useParams<{ id: string }>();
  return <TimerControl sessionId={id} />;
}