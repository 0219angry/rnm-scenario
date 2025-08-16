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

// 追加：コロン位置固定のために分解（常にHH:MM:SS）
function splitHMS(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad2 = (n: number) => n.toString().padStart(2, '0');
  return { hh: pad2(h), mm: pad2(m), ss: pad2(s) };
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

  // フェーズ位置（フェーズ未設定なら durationSec を1フェーズ扱い）＋ 各フェーズの進捗
  const phaseInfo = useMemo(() => {
    if (!data) return null;

    const phases: Phase[] =
      data.phases?.length ? data.phases :
      [{ name: data.title ?? 'Phase', seconds: data.durationSec ?? 0 }];

    // 累積開始秒と総秒
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

    // 各フェーズの（経過・割合）
    const perPhase = phases.map((p, i) => {
      const passed = Math.max(0, Math.min(p.seconds, elapsedSec - cum[i]));
      const ratio = p.seconds > 0 ? passed / p.seconds : 0;
      return { ...p, index: i, passed, ratio };
    });

    const prev = phases[idx - 1] ? { ...phases[idx - 1], index: idx - 1 } as Phase & {index:number} : null;
    const cur  = { ...phases[idx], index: idx } as Phase & {index:number};
    const next = phases[idx + 1] ? { ...phases[idx + 1], index: idx + 1 } as Phase & {index:number} : null;

    return { phases, perPhase, cum, totalSec, index: idx, curElapsedSec, curRemainingMs, prev, cur, next, elapsedSec };
  }, [data, totalElapsedMs]);

  // 表示スタイル
  const color = theme === 'dark' ? 'white' : 'black';
  const shadow = withShadow
    ? '0 0 2px rgba(0,0,0,.6), 0 0 8px rgba(0,0,0,.35), 0 0 24px rgba(0,0,0,.25)'
    : 'none';
  const strokeColor = theme === 'dark' ? 'rgba(0,0,0,.85)' : 'rgba(255,255,255,.9)';

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100%',
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
      {/* タイトル＆現在フェーズ（タイトル横の「現在:～」は好みで消してOK） */}
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

      {/* 時間の直上に現在フェーズ名（大きめ） */}
      {phaseInfo && (
        <div
          style={{
            fontSize: 28 * fontScale,
            fontWeight: 700,
            opacity: 0.95,
            textShadow: shadow,
            marginTop: -4,
          }}
        >
          {phaseInfo.cur.name}
        </div>
      )}

      {/* メイン時計（コロン固定：HH:MM:SS、等幅＋縁取り） */}
      {(() => {
        const { hh, mm, ss } = splitHMS(phaseInfo?.curRemainingMs ?? totalRemainingMs);
        const digitStyle: React.CSSProperties = {
          display: 'inline-block',
          width: '2ch',
          textAlign: 'center',
        };
        return (
          <div
            style={{
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", "Courier New", monospace',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: 1,
              fontWeight: 900,
              fontSize: 120 * fontScale,
              lineHeight: 1,
              textShadow: shadow,
              WebkitTextStroke: `1px ${strokeColor}`,
            }}
            aria-live="polite"
          >
            <span style={digitStyle}>{hh}</span>
            <span>:</span>
            <span style={digitStyle}>{mm}</span>
            <span>:</span>
            <span style={digitStyle}>{ss}</span>
          </div>
        );
      })()}

      {/* 総残り（サブ） */}
      {phaseInfo && (
        <div style={{ fontSize: 16 * fontScale, opacity: 0.85, textShadow: shadow }}>
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
              <div style={{ fontSize: 14 * fontScale, opacity: .85, marginTop: 6, textShadow: shadow }}>
                持ち時間：{fmt(phaseInfo.prev.seconds * 1000)}
              </div>
            )}
          </div>

          <div style={{ border: '2px solid rgba(255,255,255,.5)', padding: 12, borderRadius: 8 }}>
            <div style={{ fontSize: 14 * fontScale, marginBottom: 4, textShadow: shadow }}>現在</div>
            <div style={{ fontSize: 20 * fontScale, fontWeight: 700, textShadow: shadow }}>
              {phaseInfo.cur.name}
            </div>
            <div style={{ fontSize: 14 * fontScale, opacity: .9, marginTop: 6, textShadow: shadow }}>
              残り：{fmt(phaseInfo.curRemainingMs)}
            </div>
          </div>

          <div style={{ opacity: phaseInfo.next ? 0.95 : 0.35, border: '1px solid rgba(255,255,255,.2)', padding: 12, borderRadius: 8 }}>
            <div style={{ fontSize: 14 * fontScale, marginBottom: 4, textShadow: shadow }}>次フェーズ</div>
            <div style={{ fontSize: 18 * fontScale, fontWeight: 600, textShadow: shadow }}>
              {phaseInfo.next ? phaseInfo.next.name : '—'}
            </div>
            {phaseInfo.next && (
              <div style={{ fontSize: 14 * fontScale, opacity: .85, marginTop: 6, textShadow: shadow }}>
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

      {/* 追加：フェーズ一覧（進捗バー付き） */}
      {phaseInfo && (
        <div
          style={{
            marginTop: 8,
            display: 'grid',
            gap: 8,
            maxWidth: 1200,
            width: '100%',
          }}
        >
          <div style={{ fontSize: 18 * fontScale, fontWeight: 700, opacity: 0.95, textShadow: shadow }}>
            フェーズ一覧
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            {phaseInfo.perPhase.map((p) => {
              const isCurrent = p.index === phaseInfo.index;
              const ratio = Math.max(0, Math.min(1, p.ratio));
              const minHeight = Math.max(8, 10 * fontScale);
              return (
                <div
                  key={p.index}
                  style={{
                    border: isCurrent ? '2px solid rgba(255,255,255,.6)' : '1px solid rgba(255,255,255,.25)',
                    borderRadius: 8,
                    padding: 10,
                    background: isCurrent ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.05)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: 12,
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                      <div style={{ opacity: 0.8, fontSize: 14 * fontScale, width: 36, textAlign: 'right' }}>
                        {p.index + 1}.
                      </div>
                      <div style={{ fontSize: 18 * fontScale, fontWeight: 700, textShadow: shadow }}>
                        {p.name}
                      </div>
                    </div>
                    <div style={{ fontSize: 14 * fontScale, opacity: .9, textShadow: shadow }}>
                      {fmt(p.seconds * 1000)}
                      {isCurrent && (
                        <span style={{ marginLeft: 8, opacity: .9 }}>
                          （経過 {fmt(p.passed * 1000)}）
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 進捗バー */}
                  <div
                    aria-hidden
                    style={{
                      position: 'relative',
                      marginTop: 8,
                      height: minHeight,
                      borderRadius: 999,
                      overflow: 'hidden',
                      background: theme === 'dark' ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.12)',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: `${ratio * 100}%`,
                        background:
                          isCurrent
                            ? 'linear-gradient(90deg, rgba(80,196,255,.95), rgba(80,196,255,.6))'
                            : 'linear-gradient(90deg, rgba(180,180,180,.9), rgba(180,180,180,.5))',
                      }}
                    />
                  </div>

                  {/* メモ表示（あれば） */}
                  {p.note && (
                    <div style={{ marginTop: 6, fontSize: 13 * fontScale, opacity: .85 }}>
                      {p.note}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
