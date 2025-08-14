/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';
import React from 'react';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

const WIDTH = 1200;
const HEIGHT = 630;

// 長過ぎる文字を安全に裁断（サロゲートペア考慮のため Array.from）
function clampText(input: string, max = 200) {
  const arr = Array.from(input);
  return arr.length > max ? arr.slice(0, max).join('') + '…' : input;
}

async function loadFont(path: string, req: Request) {
  const origin = new URL(req.url).origin;
  const res = await fetch(`${origin}${path}`);
  if (!res.ok) {
    throw new Error(`Failed to load font from ${path}`);
  }
  return res.arrayBuffer();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const title = clampText(searchParams.get('title') ?? 'Post', 140);
  const site = clampText(searchParams.get('site') ?? 'シナリオ管理アプリ', 50);
  const desc = clampText(searchParams.get('desc') ?? '', 220);
  const accent = searchParams.get('accent') ?? '#3b82f6'; // 例: %233b82f6

  const [fontRegular, fontBold] = await Promise.all([
    loadFont('/fonts/Inter-Regular.ttf', req),
    loadFont('/fonts/Inter-Bold.ttf', req),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #eef2ff 100%)',
          fontFamily: "NotoSansJP, sans-serif",
        }}
      >
        <div
          style={{
            width: 1040,
            background: 'white',
            borderRadius: 24,
            border: '1px solid #e5e7eb',
            padding: 64,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            fontFamily: "NotoSansJP, sans-serif",
          }}
        >
          {/* ヘッダー（サイト名＋アクセント） */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                padding: '8px 14px',
                borderRadius: 9999,
                background: accent,
                color: 'white',
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              🎲
            </div>
            <div style={{ fontSize: 28, opacity: 0.85, fontWeight: 600 }}>{site}</div>
          </div>

          {/* タイトル */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              wordBreak: 'break-word',
            }}
          >
            {title}
          </div>

          {/* 説明（任意） */}
          {desc && (
            <div
              style={{
                fontSize: 28,
                color: '#475569',
                lineHeight: 1.4,
                wordBreak: 'break-word',
              }}
            >
              {desc}
            </div>
          )}
        </div>
      </div>
    ),
    { 
      width: WIDTH, 
      height: HEIGHT,
      emoji: 'twemoji',
      fonts: [
        {
          name: 'NotoSansJP',
          data: fontRegular,
          style: 'normal',
          weight: 400,
        },
        {
          name: 'NotoSansJP',
          data: fontBold,
          style: 'normal',
          weight: 700,
        },
      ] 
    }
  );
}