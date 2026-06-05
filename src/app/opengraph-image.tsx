import { ImageResponse } from "next/og";
import { siteName } from "./site";

export const runtime = "edge";
export const alt = "Vercel Env Checker report preview";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#f7f9fc",
          color: "#111827",
          fontFamily: "Arial"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 32, fontWeight: 800 }}>{siteName}</div>
          <div
            style={{
              border: "2px solid #64748b",
              borderRadius: 8,
              color: "#334155",
              fontSize: 24,
              fontWeight: 800,
              padding: "10px 16px"
            }}
          >
            NEXT.JS + VERCEL
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              color: "#0f766e",
              fontSize: 24,
              fontWeight: 800
            }}
          >
            ENV DEBUG CHECKLIST
          </div>
          <div
            style={{
              fontSize: 76,
              lineHeight: 1.02,
              fontWeight: 900,
              maxWidth: 940
            }}
          >
            Find why an env var is missing
          </div>
          <div
            style={{
              color: "#4b5563",
              fontSize: 30,
              lineHeight: 1.35,
              maxWidth: 900
            }}
          >
            Copyable commands and a safe report for undefined, stale, or
            local-only variables.
          </div>
        </div>
      </div>
    ),
    size
  );
}
