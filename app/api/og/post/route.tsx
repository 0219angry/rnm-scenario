/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'Post';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          fontSize: 64,
          fontWeight: 700,
          background: 'white',
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.6, marginBottom: 16 }}>サイト名</div>
        <div style={{ lineHeight: 1.2, wordBreak: 'break-word' }}>{title}</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}