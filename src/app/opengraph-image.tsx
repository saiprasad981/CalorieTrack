import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 35%, #0f172a 100%)",
          color: "#020617",
          padding: "56px",
          fontFamily: "sans-serif",
          justifyContent: "space-between",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                height: "72px",
                width: "72px",
                borderRadius: "24px",
                background: "#0f172a",
                color: "#ffffff",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "34px",
                fontWeight: 700,
              }}
            >
              C
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ fontSize: "38px", fontWeight: 700 }}>{siteConfig.name}</div>
              <div style={{ fontSize: "18px", color: "#1d4ed8" }}>Eat smarter, not stricter</div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.8)",
              padding: "12px 20px",
              fontSize: "18px",
              color: "#0f172a",
            }}
          >
            Smart calorie tracking
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            maxWidth: "860px",
          }}
        >
          <div style={{ fontSize: "68px", fontWeight: 800, lineHeight: 1.05 }}>
            Track calories, cravings, macros, and satiety in one premium dashboard.
          </div>
          <div style={{ fontSize: "28px", lineHeight: 1.4, color: "#0f172a" }}>
            Personalized meal guidance, behavior-aware insights, and fast food logging for real life.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
