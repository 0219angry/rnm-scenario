// app/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Webフォント（Noto Sans JP 400/700）
const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const notoSansJpRegular = fetch(
  `${baseUrl}/fonts/NotoSansJP-Regular.woff2`
).then((r) => r.arrayBuffer());

const notoSansJpBold = fetch(
  `${baseUrl}/fonts/NotoSansJP-Bold.woff2`
).then((r) => r.arrayBuffer());

export default async function Image() {
  const [regular, bold] = await Promise.all([notoSansJpRegular, notoSansJpBold]);

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
          justifyContent: "flex-start",
          gap: 48,
        }}
      >
        {/* アイコン（ノート＋虫眼鏡）：アクセントはゴールド */}
        <div
          style={{
            width: 176,
            height: 176,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 16,
              top: 16,
              width: 124,
              height: 144,
              borderRadius: 24,
              background: "#2E3A59",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 16,
              top: 16,
              width: 16,
              height: 144,
              background: "rgba(255,255,255,0.12)",
            }}
          />
          {/* 虫眼鏡 */}
          <div
            style={{
              position: "absolute",
              left: 108,
              top: 108,
              width: 60,
              height: 60,
              border: "10px solid #C89F65",
              borderRadius: 60,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 158,
              top: 158,
              width: 48,
              height: 10,
              background: "#C89F65",
              transform: "rotate(45deg)",
              borderRadius: 5,
              transformOrigin: "left center",
            }}
          />
          {/* しおり */}
          <div
            style={{
              position: "absolute",
              left: 96,
              top: 22,
              width: 28,
              height: 36,
              background: "#C89F65",
              clipPath: "polygon(0 0,100% 0,100% 70%,50% 55%,0 70%)",
            }}
          />
        </div>

        {/* タイトル＋サブタイトル（動詞強調） */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontFamily: "NotoSansJP-Bold",
              fontSize: 112,
              lineHeight: 1.1,
              letterSpacing: 1,
            }}
          >
            調査手帖
          </div>
          <div
            style={{
              fontFamily: "NotoSansJP-Regular",
              fontSize: 36,
              lineHeight: 1.5,
              color: "#E5E7EB",
            }}
          >
            <span style={{ fontFamily: "NotoSansJP-Bold", color: "#C89F65" }}>探す</span>、
            <span style={{ fontFamily: "NotoSansJP-Bold", color: "#C89F65" }}>記す</span>、
            <span style={{ fontFamily: "NotoSansJP-Bold", color: "#C89F65" }}>遊ぶ</span>。すべてをひとつの手帖に。
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "NotoSansJP-Regular", data: regular, style: "normal", weight: 400 },
        { name: "NotoSansJP-Bold", data: bold, style: "normal", weight: 700 },
      ],
    }
  );
}
