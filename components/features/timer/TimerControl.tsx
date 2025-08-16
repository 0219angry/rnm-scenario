'use client';
import { useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Phase = { name: string; seconds: number; note?: string };
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

function tsToMillis(t?: TimerState['startedAt'] | null) {
  if (!t) return undefined;
  if (t instanceof Timestamp) return t.toMillis();
  if ('seconds' in t && typeof t.seconds === 'number') return t.seconds * 1000;
  return undefined;
}

function totalSeconds(st?: TimerState | null) {
  if (!st) return 0;
  if (st.phases?.length) return st.phases.reduce((s, p) => s + (p.seconds || 0), 0);
  return st.durationSec ?? 0;
}

function fmt(ms: number) {
  const v = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(v / 3600);
  const m = Math.floor((v % 3600) / 60);
  const s = v % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

// 直前に Action 型を定義
type TimerAction =
  | { type: 'start'; title?: string }
  | { type: 'pause' }
  | { type: 'reset' }
  | { type: 'add'; seconds: number }
  | { type: 'config'; title: string; phases: Phase[] };

// 修正後
async function postAction(sessionId: string, body: TimerAction) {
  const res = await fetch(`/api/sessions/${sessionId}/timer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export function TimerControl({ sessionId }: { sessionId: string }) {
  const [remote, setRemote] = useState<TimerState | null>(null);

  // 編集用ローカル状態
  const [title, setTitle] = useState<string>('');
  const [phases, setPhases] = useState<Phase[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Firestore購読（read-only）
  useEffect(() => {
    const ref = doc(db, 'sessions', sessionId, 'timerState', 'state');
    const unsub = onSnapshot(ref, (snap) => {
      const d = snap.data() as TimerState | undefined;
      const st: TimerState | null = d ?? null;
      setRemote(st);

      // 初回 or リモート更新をフォームへ反映（編集中の上書きは軽め）
      if (st) {
        setTitle((t) => (t === '' ? (st.title ?? 'セッション') : t));
        setPhases((ps) =>
          ps.length === 0
            ? (st.phases?.length
                ? st.phases
                : [{ name: st.title ?? 'Phase', seconds: st.durationSec ?? 0 }])
            : ps
        );
      }
    });
    return () => unsub();
  }, [sessionId]);

  // 進行状況（総残りと現在フェーズ）
  const progress = useMemo(() => {
    if (!remote) return null;
    const base = totalSeconds(remote) * 1000;
    const startMs = tsToMillis(remote.startedAt);
    const extra = remote.status === 'running' && startMs ? Date.now() - startMs : 0;
    const elapsed = Math.max(0, (remote.elapsedMs ?? 0) + extra);
    const totalRemainingMs = Math.max(0, base - elapsed);

    const effectivePhases =
      remote.phases?.length ? remote.phases : [{ name: remote.title ?? 'Phase', seconds: remote.durationSec ?? 0 }];

    let acc = 0;
    const cum: number[] = [];
    for (const p of effectivePhases) { cum.push(acc); acc += p.seconds; }

    const elapsedSec = Math.floor(elapsed / 1000);
    let idx = effectivePhases.length - 1;
    for (let i = 0; i < effectivePhases.length; i++) {
      if (elapsedSec < cum[i] + effectivePhases[i].seconds) { idx = i; break; }
    }
    const startSec = cum[idx];
    const curElapsedSec = Math.max(0, Math.min(effectivePhases[idx].seconds, elapsedSec - startSec));
    const curRemainingMs = Math.max(0, (effectivePhases[idx].seconds - curElapsedSec) * 1000);

    return {
      totalRemainingMs,
      effectivePhases,
      index: idx,
      curRemainingMs,
    };
  }, [remote]);

  const totalFormSec = useMemo(
    () => phases.reduce((s, p) => s + (Number.isFinite(p.seconds) ? p.seconds : 0), 0),
    [phases]
  );

  // --- 操作 ---

  const saveConfig = async () => {
    setSaving(true); setMsg(null);
    try {
      // note はそのまま、seconds は0未満防止
      const clean = phases.map(p => ({ name: p.name || 'Phase', seconds: Math.max(0, Math.floor(p.seconds)), note: p.note?.trim() || undefined }));
      await postAction(sessionId, { type: 'config', title: title || 'セッション', phases: clean });
      setMsg('保存しました！');
    } catch {
      setMsg('保存に失敗しちゃいました…もう一度試してほしいです…');
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 2500);
    }
  };

  const start = async () => { try { await postAction(sessionId, { type: 'start', title }); } catch {} };
  const pause = async () => { try { await postAction(sessionId, { type: 'pause' }); } catch {} };
  const reset = async () => { try { await postAction(sessionId, { type: 'reset' }); } catch {} };

  // 現在フェーズに+5分（ローカルを更新→保存）
  const add5ToCurrentPhase = async () => {
    if (!progress) return;
    const idx = progress.index;
    setPhases((ps) => {
      const next = [...ps];
      if (next[idx]) next[idx] = { ...next[idx], seconds: (next[idx].seconds ?? 0) + 300 };
      return next;
    });
    await saveConfig();
  };

  // フェーズ編集
  const addPhase = () => setPhases(ps => [...ps, { name: `フェーズ${ps.length + 1}`, seconds: 5 * 60 }]);
  const removePhase = (i: number) => setPhases(ps => ps.filter((_, idx) => idx !== i));
  const moveUp = (i: number) => setPhases(ps => {
    if (i <= 0) return ps;
    const next = [...ps]; [next[i-1], next[i]] = [next[i], next[i-1]]; return next;
  });
  const moveDown = (i: number) => setPhases(ps => {
    if (i >= ps.length - 1) return ps;
    const next = [...ps]; [next[i+1], next[i]] = [next[i], next[i+1]]; return next;
  });
  const updateName = (i: number, v: string) => setPhases(ps => ps.map((p, idx) => idx === i ? { ...p, name: v } : p));
  const updateMinutes = (i: number, v: string) => {
    const min = Math.max(0, Math.floor(Number(v) || 0));
    setPhases(ps => ps.map((p, idx) => idx === i ? { ...p, seconds: min * 60 } : p));
  };
  const updateNote = (i: number, v: string) => setPhases(ps => ps.map((p, idx) => idx === i ? { ...p, note: v } : p));

  return (
    <div style={{ maxWidth: 900, margin: '24px auto', padding: 16, display: 'grid', gap: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Timer Control</h1>

      {/* ステータス表示 */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', flexWrap: 'wrap' }}>
        <div>状態：<b>{remote?.status ?? '—'}</b></div>
        <div>全体残り：<b>{remote ? fmt(progress?.totalRemainingMs ?? 0) : '—'}</b></div>
        <div>現在フェーズ：<b>{progress ? `${progress.index + 1}/${progress.effectivePhases.length}` : '—'}</b></div>
        <div>このフェーズ残り：<b>{progress ? fmt(progress.curRemainingMs) : '—'}</b></div>
      </div>

      {/* タイトル */}
      <label style={{ display: 'grid', gap: 6 }}>
        <span>タイトル</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="マダミス・セッション"
          style={{ padding: '8px 10px', border: '1px solid #ccc', borderRadius: 6 }}
        />
      </label>

      {/* フェーズ編集テーブル */}
      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr auto', gap: 8, fontSize: 12, opacity: 0.7 }}>
          <div>フェーズ名</div>
          <div>分</div>
          <div>メモ（任意）</div>
          <div>操作</div>
        </div>

        {phases.map((p, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr auto', gap: 8, alignItems: 'center' }}>
            <input
              value={p.name}
              onChange={(e) => updateName(i, e.target.value)}
              style={{ padding: '8px 10px', border: '1px solid #ccc', borderRadius: 6 }}
            />
            <input
              inputMode="numeric"
              value={Math.floor((p.seconds ?? 0) / 60).toString()}
              onChange={(e) => updateMinutes(i, e.target.value)}
              style={{ padding: '8px 10px', border: '1px solid #ccc', borderRadius: 6, width: '7em' }}
            />
            <input
              value={p.note ?? ''}
              onChange={(e) => updateNote(i, e.target.value)}
              placeholder="例：推理・議論・休憩 など"
              style={{ padding: '8px 10px', border: '1px solid #ccc', borderRadius: 6 }}
            />
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button onClick={() => moveUp(i)}   title="上へ">↑</button>
              <button onClick={() => moveDown(i)} title="下へ">↓</button>
              <button onClick={() => removePhase(i)} style={{ color: '#b00' }}>削除</button>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={addPhase}>＋ フェーズを追加</button>
          <div style={{ marginLeft: 'auto', opacity: 0.8 }}>
            合計：<b>{Math.floor(totalFormSec / 60)}</b> 分（{fmt(totalFormSec * 1000)}）
          </div>
        </div>
      </div>

      {/* 操作ボタン */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={saveConfig} disabled={saving}>設定を保存</button>
        <button onClick={start}>Start</button>
        <button onClick={pause}>Pause</button>
        <button onClick={reset}>Reset</button>
        <button onClick={add5ToCurrentPhase}>現在フェーズに +5分</button>
        {msg && <span style={{ marginLeft: 12, opacity: 0.85 }}>{msg}</span>}
      </div>

      {/* 表示URLの案内（コピペ用） */}
      <div style={{ fontSize: 12, opacity: 0.8 }}>
        表示URL： <code>{typeof window !== 'undefined' ? `${location.origin}/sessions/${sessionId}/timer` : `/sessions/${sessionId}/timer`}</code><br />
        例：<code>?theme=dark&fontScale=1.2&showTitle=0&hideSchedule=0&shadow=1</code>
      </div>
    </div>
  );
}