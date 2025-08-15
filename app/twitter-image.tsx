// app/twitter-image.tsx
import { headers } from "next/headers";
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const h = headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;

  // public/fonts から実行時に取得（ビルド時fetchを避ける）
  const [serifRegular, serifBold] = await Promise.all([
    fetch(`${origin}/fonts/NotoSerifJP-Regular.woff2`).then(r => r.arrayBuffer()),
    fetch(`${origin}/fonts/NotoSerifJP-Bold.woff2`).then(r => r.arrayBuffer()),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(180deg,#0B1220 0%,#1B2435 100%)",
          color: "#F5F0E6",
          padding: 64,
          alignItems: "center",
          gap: 48,
        }}
      >
        {/* アイコン */}
        <div style={{ width: 176, height: 176, position: "relative", display: "flex" }}>
          <div style={{ position: "absolute", left: 16, top: 16, width: 124, height: 144, borderRadius: 24, background: "#2E3A59" }}/>
          <div style={{ position: "absolute", left: 16, top: 16, width: 16, height: 144, background: "rgba(255,255,255,0.12)" }}/>
          <div style={{ position: "absolute", left: 108, top: 108, width: 60, height: 60, border: "10px solid #C89F65", borderRadius: 60 }}/>
          <div style={{ position: "absolute", left: 158, top: 158, width: 48, height: 10, background: "#C89F65", transform: "rotate(45deg)", borderRadius: 5, transformOrigin: "left center" }}/>
          <div style={{ position: "absolute", left: 96, top: 22, width: 28, height: 36, background: "#C89F65", clipPath: "polygon(0 0,100% 0,100% 70%,50% 55%,0 70%)" }}/>
        </div>

        {/* タイトル＆サブコピー */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 860 }}>
          <div style={{ fontFamily: "NotoSerifJP-Bold", fontSize: 112, lineHeight: 1.1, letterSpacing: 1 }}>
            調査手帖
          </div>

          <div style={{ display: "flex", alignItems: "baseline", fontFamily: "NotoSerifJP-Regular", fontSize: 36, lineHeight: 1.5, color: "#E5E7EB" }}>
            <b style={{ fontFamily: "NotoSerifJP-Bold", color: "#C89F65" }}>探す</b><span>、</span>
            <b style={{ fontFamily: "NotoSerifJP-Bold", color: "#C89F65" }}>記す</b><span>、</span>
            <b style={{ fontFamily: "NotoSerifJP-Bold", color: "#C89F65" }}>遊ぶ</b><span>。すべてをひとつの手帖に。</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "NotoSerifJP-Regular", data: serifRegular, weight: 400, style: "normal" },
        { name: "NotoSerifJP-Bold", data: serifBold, weight: 700, style: "normal" },
      ],
    }
  );
}