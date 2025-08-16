// app/sessions/[id]/timer/page.tsx
'use client';
import { useSearchParams, useParams } from 'next/navigation';
import { TimerView } from '@/components/features/timer/TimerView';

export default function Page() {
  const sp = useSearchParams();
  const { id } = useParams<{ id: string }>();

  return (
    <TimerView
      sessionId={id}
      theme={(sp.get('theme') as 'dark' | 'light') ?? 'dark'}
      fontScale={Number(sp.get('fontScale') ?? '1')}
      hideTitle={sp.get('showTitle') === '0'}
      hideSchedule={sp.get('hideSchedule') === '1'}
      withShadow={sp.get('shadow') !== '0'}
    />
  );
}