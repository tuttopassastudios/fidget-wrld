import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt = "Fidget WRLD — Premium Fidget Toys & Sensory Tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #F8FAFC 0%, #E0F2FE 50%, #DBEAFE 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative dots */}
        <div
          style={{
            position: "absolute",
            top: "60px",
            left: "80px",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "#3B82F6",
            opacity: 0.3,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "120px",
            right: "120px",
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            background: "#22C55E",
            opacity: 0.4,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "100px",
            left: "150px",
            width: "25px",
            height: "25px",
            borderRadius: "50%",
            background: "#06B6D4",
            opacity: 0.3,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "80px",
            right: "100px",
            width: "15px",
            height: "15px",
            borderRadius: "50%",
            background: "#8B5CF6",
            opacity: 0.4,
            display: "flex",
          }}
        />

        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background:
              "linear-gradient(90deg, #3B82F6 0%, #06B6D4 50%, #22C55E 100%)",
            display: "flex",
          }}
        />

        {/* Brand name */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: 800,
            background: "linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #22C55E 100%)",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: "16px",
            display: "flex",
          }}
        >
          FIDGET WRLD
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "28px",
            color: "#4B5563",
            letterSpacing: "2px",
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          Premium Fidget Toys & Sensory Tools
        </div>

        {/* Bottom features */}
        <div
          style={{
            position: "absolute",
            bottom: "50px",
            display: "flex",
            alignItems: "center",
            gap: "32px",
            color: "#3B82F6",
            fontSize: "16px",
            letterSpacing: "1px",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          <span>Free Shipping $50+</span>
          <span style={{ color: "#06B6D4" }}>*</span>
          <span>Quality Tested</span>
          <span style={{ color: "#06B6D4" }}>*</span>
          <span>Fast Delivery</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
