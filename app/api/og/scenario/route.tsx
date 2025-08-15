// app/api/og/scenario/route.ts
import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);

  // 受け取り
  const title   = searchParams.get("title")   ?? "";
  const desc    = searchParams.get("desc")    ?? "";
  const genre   = searchParams.get("genre")   ?? "";
  const players = searchParams.get("players") ?? "";
  const time    = searchParams.get("time")    ?? "";
  const gm      = searchParams.get("gm")      ?? "";
  const rule    = searchParams.get("rule")    ?? "";
  const price   = searchParams.get("price")   ?? "";
  const accent  = searchParams.get("accent")  ?? "#3b82f6";

  // フォント
  const [serifRegular, serifBold] = await Promise.all([
    fetch(`${origin}/fonts/NotoSerifJP-Regular.ttf`).then(r => r.arrayBuffer()),
    fetch(`${origin}/fonts/NotoSerifJP-Bold.ttf`).then(r => r.arrayBuffer()),
  ]);

  try {
    return new ImageResponse(
      (
        <div style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          background: "linear-gradient(180deg,#0B1220 0%,#1B2435 100%)",
          color: "#F5F0E6",
          padding: "64px",
          boxSizing: "border-box",
          gap: "32px",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
        }}>
          {/* サイト名 */}
          <div style={{
            display: "flex",
            fontFamily: "NotoSerifJP-Bold",
            fontSize: 42,
            color: "#E5E7EB",
          }}>
            調査手帖
          </div>

          {/* タイトル */}
          <div style={{
            display: "flex",
            fontFamily: "NotoSerifJP-Bold",
            fontSize: 64,
            lineHeight: 1.2,
            maxWidth: 1000,
          }}>
            {title}
          </div>

          {/* 要約 */}
          {desc && (
            <div style={{
              display: "flex",
              fontFamily: "NotoSerifJP-Regular",
              fontSize: 28,
              lineHeight: 1.5,
              color: "#E5E7EB",
              maxWidth: 1000,
            }}>
              {desc}
            </div>
          )}

          {/* バッジエリア */}
          <div style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "center",
            marginTop: 8,
          }}>
            {genre   && <Badge label={genre} accent={accent} />}
            {players && <Badge label={`人数: ${players}`} accent={accent} />}
            {time    && <Badge label={`時間: ${time}`} accent={accent} />}
            {gm      && <Badge label={gm} accent={accent} />}
            {rule    && <Badge label={rule} color="sub" accent={accent} />}
            {price   && <Badge label={`価格: ${price}`} color="sub" accent={accent} />}
          </div>

          {/* ブランドライン */}
          <div style={{
            display: "flex",
            height: 6,
            width: 640,
            background: accent,
            borderRadius: 3,
            marginTop: 16,
          }} />
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: "NotoSerifJP-Regular", data: serifRegular, weight: 400 as const, style: "normal" },
          { name: "NotoSerifJP-Bold", data: serifBold, weight: 700 as const, style: "normal" },
        ],
      }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return new ImageResponse(
      <div style={{ width: 1200, height: 630, display: "flex", padding: 60, background: "#111827", color: "#F9FAFB", fontSize: 32 }}>
        OGP fallback / {msg}
      </div>,
      { width: 1200, height: 630 }
    );
  }
}

function Badge({
  label,
  color = "primary",
  accent = "#3b82f6",
}: {
  label: string;
  color?: "primary" | "sub";
  accent?: string;
}) {
  const isSub = color === "sub";
  const bg = isSub ? "rgba(255,255,255,0.10)" : hexToRgba(accent, 0.20);
  const border = isSub ? "rgba(255,255,255,0.22)" : hexToRgba(accent, 0.45);
  const text = isSub ? "#CBD5E1" : "#E6F0FF";
  return (
    <div style={{
      display: "flex",
      fontFamily: "NotoSerifJP-Bold",
      fontSize: 24,
      padding: "8px 14px",
      borderRadius: 14,
      background: bg,
      color: text,
      border: `1px solid ${border}`,
    }}>
      {label}
    </div>
  );
}

function hexToRgba(hex: string, alpha = 1) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return `rgba(59,130,246,${alpha})`;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
