// app/api/sessions/[id]/timer/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { adminDb } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase/firestore';

type Phase = { name: string; seconds: number; note?: string };
type TimerAction =
  | { type: 'start'; title?: string }
  | { type: 'pause' }
  | { type: 'reset' }
  | { type: 'add'; seconds: number }
  | { type: 'config'; title: string; phases: Phase[] };

type AgendaItem = { label: string; at: string };

type TimerState = {
  status: 'idle' | 'running' | 'paused';
  durationSec: number; // phasesがあれば無視
  startedAt?: Timestamp | { seconds: number; nanoseconds: number } | null;
  elapsedMs: number;
  title?: string;
  agenda?: AgendaItem[];
  phases?: Phase[];
  showPhaseStrip?: boolean;
};

// Firestore Timestamp or PlainObject → ミリ秒変換
const tsToMillis = (t?: TimerState['startedAt'] | null) => {
  if (!t) return undefined;
  if (t instanceof Timestamp) return t.toMillis();
  if ('seconds' in t && typeof t.seconds === 'number') {
    return t.seconds * 1000;
  }
  return undefined;
};

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const sessionId = (await context.params).id;

  // 認証・権限チェック（GMのみ許可）
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { ownerId: true },
  });
  if (!session || session.ownerId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await req.json()) as TimerAction;
  const ref = adminDb.doc(`sessions/${sessionId}/timerState/state`);
  const snap = await ref.get();

  const now = Date.now();
  const cur: TimerState = snap.exists
    ? (snap.data() as TimerState) // Firestore の型をキャスト
    : {
        status: 'idle',
        durationSec: 3600,
        startedAt: null,
        elapsedMs: 0,
        title: 'セッション',
        agenda: [],
        phases: [{ name: 'Phase 1', seconds: 300 }],
      };

  const calcElapsed = (d: TimerState) => {
    const start = tsToMillis(d.startedAt);
    return d.status === 'running' && start
      ? (d.elapsedMs ?? 0) + (now - start)
      : d.elapsedMs ?? 0;
  };

  const totalSeconds = (phases?: Phase[], durationSec?: number) =>
    phases?.length ? phases.reduce((s, p) => s + (p.seconds || 0), 0) : durationSec ?? 0;

  const next: TimerState = { ...cur };

  switch (body.type) {
    case 'start': {
      if (next.status !== 'running') {
        next.status = 'running';
        next.startedAt = { seconds: Math.floor(now / 1000), nanoseconds: 0 };
        if (body.title) next.title = body.title;
      }
      break;
    }
    case 'pause': {
      const elapsed = calcElapsed(next);
      next.status = 'paused';
      next.startedAt = null;
      next.elapsedMs = elapsed;
      break;
    }
    case 'reset': {
      next.status = 'idle';
      next.startedAt = null;
      next.elapsedMs = 0;
      break;
    }
    case 'add': {
      next.durationSec = Math.max(
        0,
        (next.durationSec ?? 0) + (body.seconds || 0)
      );
      break;
    }
    case 'config': {
      next.title = body.title?.trim() || 'セッション';
      next.phases = Array.isArray(body.phases)
        ? body.phases.map((p) => {
            const name = (p.name || 'Phase').trim();
            const seconds = Math.max(0, Math.floor(Number(p.seconds) || 0));
            const note = p.note?.trim();
            return note
              ? { name, seconds, note }         // noteがあるときだけ含める
              : { name, seconds };              // ないときはキー自体を持たせない
          })
        : [];
      next.durationSec = totalSeconds(next.phases, next.durationSec);
      break;
    }
    default:
      return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  await ref.set(next, { merge: true });
  return NextResponse.json({ ok: true });
}
