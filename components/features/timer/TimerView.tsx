// components/TimerView.tsx
'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type AgendaItem = { label: string; at: string }; // ISO文字列（表示用）
type Phase = { name: string; seconds: number; note?: string };

type TimerState = {
  status: 'idle' | 'running' | 'paused';
  /** phases がある場合は合計秒に置き換えられる */
  durationSec: number;
  /** Firestore Timestamp または {seconds,nanoseconds} */
  startedAt?: Timestamp | { seconds: number; nanoseconds: number } | null;
  /** 一時停止までの累積経過ms（running時は startedAt からの分を加算） */
  elapsedMs: number;
  title?: string;
  agenda?: AgendaItem[];
  /** 追加：フェーズ配列（先頭→末尾の順に進行） */
  phases?: Phase[];
  /** 追加：前後フェーズ帯の表示切替 */
  showPhaseStrip?: boolean;
};

export type TimerViewProps = {
  /** Firestore: sessions/{id}/timerState/state の {id} */
  sessionId: string;
  /** ダーク/ライト */
  theme?: 'dark' | 'light';
  /** 文字倍率（1=標準） */
  fontScale?: number;
  /** タイトル非表示 */
  hideTitle?: boolean;
  /** スケジュール非表示 */
  hideSchedule?: boolean;
  /** 影（輪郭） */
  withShadow?: boolean;
};

function fmt(ms: number) {
  const v = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(v / 3600);
  const m = Math.floor((v % 3600) / 60);
  const s = v % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function tsToMillis(t?: TimerState['startedAt'] | null) {
  if (!t) return undefined;
  if (t instanceof Timestamp) return t.toMillis();
  if ('seconds' in t && typeof t.seconds === 'number') return t.seconds * 1000;
  return undefined;
}

function totalSeconds(d?: TimerState | null) {
  if (!d) return 0;
  if (d.phases?.length) return d.phases.reduce((s, p) => s + (p.seconds || 0), 0);
  return d.durationSec ?? 0;
}

export function TimerView({
  sessionId,
  theme = 'dark',
  fontScale = 1,
  hideTitle = false,
  hideSchedule = false,
  withShadow = true,
}: TimerViewProps) {
  const [data, setData] = useState<TimerState | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const rafRef = useRef<number | null>(null);

  // Firestore購読（read-only）
  useEffect(() => {
    const ref = doc(db, 'sessions', sessionId, 'timerState', 'state');
    const unsub = onSnapshot(ref, (snap) => {
      const d = snap.data() as TimerState | undefined;
      setData(d ?? null);
    });
    return () => unsub();
  }, [sessionId]);

  // なめらか更新
  useEffect(() => {
    const tick = () => {
      setNow(Date.now());
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // 総経過/残り
  const { totalRemainingMs, totalElapsedMs } = useMemo(() => {
    if (!data) return { totalRemainingMs: 0, totalElapsedMs: 0 };
    const base = totalSeconds(data) * 1000;
    const startMs = tsToMillis(data.startedAt);
    const extra = data.status === 'running' && startMs ? now - startMs : 0;
    const elapsed = Math.max(0, (data.elapsedMs ?? 0) + extra);
    return { totalRemainingMs: Math.max(0, base - elapsed), totalElapsedMs: elapsed };
  }, [data, now]);

  // フェーズ位置（フェーズ未設定なら durationSec を1フェーズ扱い）
  const phaseInfo = useMemo(() => {
    if (!data) return null;

    const phases: Phase[] =
      data.phases?.length ? data.phases :
      [{ name: data.title ?? 'Phase', seconds: data.durationSec ?? 0 }];

    const cum: number[] = [];
    let acc = 0;
    for (const p of phases) { cum.push(acc); acc += p.seconds; }
    const totalSec = acc;

    const elapsedSec = Math.floor(totalElapsedMs / 1000);
    let idx = phases.length - 1;
    for (let i = 0; i < phases.length; i++) {
      if (elapsedSec < cum[i] + phases[i].seconds) { idx = i; break; }
    }

    const startSec = cum[idx];
    const curElapsedSec = Math.max(0, Math.min(phases[idx].seconds, elapsedSec - startSec));
    const curRemainingMs = Math.max(0, (phases[idx].seconds - curElapsedSec) * 1000);

    const prev = phases[idx - 1] ? { ...phases[idx - 1], index: idx - 1 } as Phase & {index:number} : null;
    const cur  = { ...phases[idx], index: idx } as Phase & {index:number};
    const next = phases[idx + 1] ? { ...phases[idx + 1], index: idx + 1 } as Phase & {index:number} : null;

    return { phases, totalSec, index: idx, curElapsedSec, curRemainingMs, prev, cur, next };
  }, [data, totalElapsedMs]);

  // 表示スタイル
  const color = theme === 'dark' ? 'white' : 'black';
  const shadow = withShadow ? '0 0 3px rgba(0,0,0,.6), 0 0 12px rgba(0,0,0,.35)' : 'none';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'transparent',
        color,
        fontFamily:
          'system-ui, -apple-system, Segoe UI, Roboto, Noto Sans JP, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      {/* タイトル＆現在フェーズ */}
      {!hideTitle && (
        <div style={{ fontSize: 24 * fontScale, opacity: 0.9, textShadow: shadow }}>
          {data?.title ?? 'Session Timer'}
          {phaseInfo && phaseInfo.phases.length > 1 && (
            <span style={{ marginLeft: 12, fontSize: 18 * fontScale, opacity: 0.8 }}>
              ／ 現在: {phaseInfo.cur.name} ({phaseInfo.cur.index + 1}/{phaseInfo.phases.length})
            </span>
          )}
        </div>
      )}

      {/* メイン時計（現在フェーズ残り。フェーズなしなら全体残り） */}
      <div
        style={{
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: 1,
          fontWeight: 800,
          fontSize: 120 * fontScale,
          lineHeight: 1,
          textShadow: shadow,
        }}
        aria-live="polite"
      >
        {fmt(phaseInfo?.curRemainingMs ?? totalRemainingMs)}
      </div>

      {/* 総残り（サブ） */}
      {phaseInfo && (
        <div style={{ fontSize: 16 * fontScale, opacity: 0.8, textShadow: shadow }}>
          全体の残り：{fmt(totalRemainingMs)}
        </div>
      )}

      {/* 前後フェーズ帯 */}
      {phaseInfo && (data?.showPhaseStrip ?? true) && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 12,
            alignItems: 'stretch',
            maxWidth: 1200,
            width: '100%',
          }}
        >
          <div style={{ opacity: phaseInfo.prev ? 0.7 : 0.35, border: '1px solid rgba(255,255,255,.2)', padding: 12, borderRadius: 8 }}>
            <div style={{ fontSize: 14 * fontScale, marginBottom: 4, textShadow: shadow }}>前フェーズ</div>
            <div style={{ fontSize: 18 * fontScale, fontWeight: 600, textShadow: shadow }}>
              {phaseInfo.prev ? phaseInfo.prev.name : '—'}
            </div>
            {phaseInfo.prev && (
              <div style={{ fontSize: 14 * fontScale, opacity: .8, marginTop: 6, textShadow: shadow }}>
                持ち時間：{fmt(phaseInfo.prev.seconds * 1000)}
              </div>
            )}
          </div>

          <div style={{ border: '2px solid rgba(255,255,255,.5)', padding: 12, borderRadius: 8 }}>
            <div style={{ fontSize: 14 * fontScale, marginBottom: 4, textShadow: shadow }}>現在</div>
            <div style={{ fontSize: 20 * fontScale, fontWeight: 700, textShadow: shadow }}>
              {phaseInfo.cur.name}
            </div>
            <div style={{ fontSize: 14 * fontScale, opacity: .85, marginTop: 6, textShadow: shadow }}>
              残り：{fmt(phaseInfo.curRemainingMs)}
            </div>
          </div>

          <div style={{ opacity: phaseInfo.next ? 0.95 : 0.35, border: '1px solid rgba(255,255,255,.2)', padding: 12, borderRadius: 8 }}>
            <div style={{ fontSize: 14 * fontScale, marginBottom: 4, textShadow: shadow }}>次フェーズ</div>
            <div style={{ fontSize: 18 * fontScale, fontWeight: 600, textShadow: shadow }}>
              {phaseInfo.next ? phaseInfo.next.name : '—'}
            </div>
            {phaseInfo.next && (
              <div style={{ fontSize: 14 * fontScale, opacity: .8, marginTop: 6, textShadow: shadow }}>
                持ち時間：{fmt(phaseInfo.next.seconds * 1000)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* スケジュール（任意表示） */}
      {!hideSchedule && data?.agenda?.length ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '10em 1fr',
            gap: 8,
            fontSize: 20 * fontScale,
            alignItems: 'baseline',
            maxWidth: 1200,
          }}
        >
          {data.agenda.map((a, i) => {
            const t = new Date(a.at);
            const tt = isNaN(t.getTime())
              ? a.at
              : t.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
            return (
              <div key={i} style={{ display: 'contents' }}>
                <div style={{ opacity: 0.7, textShadow: shadow }}>{tt}</div>
                <div style={{ textShadow: shadow }}>{a.label}</div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}