'use client';
import { TimerControl } from '@/components/features/timer/TimerControl';

export default function Page({ params }: { params: { id: string } }) {
  return <TimerControl sessionId={params.id} />;
}