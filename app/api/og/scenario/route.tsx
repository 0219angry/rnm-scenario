// app/api/og/scenario/route.ts
import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const contentType = "image/png";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);

  // ?simple=1 でフォントなしの簡易チェック
  if (searchParams.get("simple") === "1") {
    return new ImageResponse(
      <div style={{
        width: 1200, height: 630, display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "#111827", color: "#F9FAFB", fontSize: 48
      }}>
        OGP Simple / scenario
      </div>,
      { width: 1200, height: 630 }
    );
  }

  // 受け取り
  const title   = searchParams.get("title")   ?? "";
  const site    = searchParams.get("site")    ?? "調査手帖";
  const desc    = searchParams.get("desc")    ?? "";
  const genre   = searchParams.get("genre")   ?? "";
  const players = searchParams.get("players") ?? ""; // "2〜4人" など
  const time    = searchParams.get("time")    ?? ""; // "180分"
  const gm      = searchParams.get("gm")      ?? ""; // "GM必須"/"GMレス"
  const rule    = searchParams.get("rule")    ?? "";
  const price   = searchParams.get("price")   ?? "";
  const accent  = searchParams.get("accent")  ?? "#3b82f6";

  // フォントは安全取得：失敗時は fonts を渡さない（=落ちない）
  async function safeFont(url: string) {
    try {
      const r = await fetch(url);
      if (!r.ok) return undefined;
      const ct = r.headers.get("content-type") ?? "";
      if (!/font|octet-stream/.test(ct)) return undefined;
      return await r.arrayBuffer();
    } catch { return undefined; }
  }
  const [serifRegular, serifBold] = await Promise.all([
    safeFont(`${origin}/fonts/NotoSerifJP-Regular.ttf`),
    safeFont(`${origin}/fonts/NotoSerifJP-Bold.ttf`),
  ]);
  const fonts = [];
if (serifRegular) fonts.push({ name: "NotoSerifJP-Regular", data: serifRegular, weight: 400 as 400, style: "normal" as const });
if (serifBold)    fonts.push({ name: "NotoSerifJP-Bold",    data: serifBold,    weight: 700 as 700, style: "normal" as const });

  // バッジ用ユーティリティ
  const Badge = ({ label, tone = "primary" }: { label: string; tone?: "primary" | "sub" }) => {
    const bg = tone === "sub" ? "rgba(255,255,255,0.10)" : hexToRgba(accent, 0.20);
    const br = tone === "sub" ? "rgba(255,255,255,0.22)" : hexToRgba(accent, 0.45);
    const tx = tone === "sub" ? "#CBD5E1" : "#E6F0FF";
    return (
      <div style={{
        display: "flex", padding: "8px 14px", borderRadius: 14,
        background: bg, border: `1px solid ${br}`, color: tx,
        fontFamily: "NotoSerifJP-Bold", fontSize: 24
      }}>{label}</div>
    );
  };
  function hexToRgba(hex: string, a = 1) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return `rgba(59,130,246,${a})`;
    const [r,g,b] = [parseInt(m[1],16), parseInt(m[2],16), parseInt(m[3],16)];
    return `rgba(${r},${g},${b},${a})`;
  }

  return new ImageResponse(
    (
      <div style={{
        width: 1200, height: 630, display: "flex",
        background: "linear-gradient(180deg,#0B1220 0%,#1B2435 100%)",
        color: "#F5F0E6", padding: 64, boxSizing: "border-box",
        gap: 28, flexDirection: "column", justifyContent: "center", alignItems: "flex-start",
      }}>
        {/* サイト名 */}
        <div style={{ display: "flex", fontFamily: "NotoSerifJP-Bold", fontSize: 42, color: "#E5E7EB" }}>
          {site}
        </div>

        {/* タイトル */}
        <div style={{
          display: "flex", fontFamily: "NotoSerifJP-Bold",
          fontSize: 64, lineHeight: 1.2, maxWidth: 1000
        }}>
          {title}
        </div>

        {/* 要約 */}
        {desc && (
          <div style={{
            display: "flex", fontFamily: "NotoSerifJP-Regular",
            fontSize: 28, lineHeight: 1.5, color: "#E5E7EB", maxWidth: 1000
          }}>
            {desc}
          </div>
        )}

        {/* 情報バッジ */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginTop: 6 }}>
          {genre   && <Badge label={genre} />}
          {players && <Badge label={`人数: ${players}`} />}
          {time    && <Badge label={`時間: ${time}`} />}
          {gm      && <Badge label={gm} />}
          {rule    && <Badge label={rule} tone="sub" />}
          {price   && <Badge label={`価格: ${price}`} tone="sub" />}
        </div>

        {/* フッター: ブランドライン */}
        <div style={{ display: "flex", height: 6, width: 640, background: accent, borderRadius: 3, marginTop: 12 }} />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      ...(fonts.length ? { fonts } : {}),  // ★ 取得できた時だけ渡す
    }
  );
}