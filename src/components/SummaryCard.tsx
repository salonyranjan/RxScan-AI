"use client"

interface SummaryCardProps {
  title: string
  value: string | number
  description: string
  variant?: "primary" | "info" | "caution" | "critical"
  trend?: "up" | "down" | "stable"
  trendValue?: string
}

const VARIANTS = {
  primary: {
    accent: "#3d85f7",
    accentMid: "#1a4fa8",
    accentAlpha: "rgba(61,133,247,0.08)",
    accentBorder: "rgba(61,133,247,0.2)",
    accentGlow: "rgba(61,133,247,0.15)",
    labelColor: "rgba(61,133,247,0.65)",
    valueFrom: "#e0eeff",
    valueTo: "#3d85f7",
    tagBg: "rgba(61,133,247,0.08)",
    tagBorder: "rgba(61,133,247,0.2)",
    tagText: "#7aaaf7",
    barFrom: "#1a4fa8",
    barTo: "#3d85f7",
    glyph: "◈",
  },
  info: {
    accent: "#00c896",
    accentMid: "#00956f",
    accentAlpha: "rgba(0,200,150,0.07)",
    accentBorder: "rgba(0,200,150,0.2)",
    accentGlow: "rgba(0,200,150,0.12)",
    labelColor: "rgba(0,200,150,0.65)",
    valueFrom: "#d6fff5",
    valueTo: "#00c896",
    tagBg: "rgba(0,200,150,0.08)",
    tagBorder: "rgba(0,200,150,0.2)",
    tagText: "#4debb8",
    barFrom: "#00956f",
    barTo: "#00c896",
    glyph: "◉",
  },
  caution: {
    accent: "#f0a832",
    accentMid: "#c07a10",
    accentAlpha: "rgba(240,168,50,0.07)",
    accentBorder: "rgba(240,168,50,0.2)",
    accentGlow: "rgba(240,168,50,0.12)",
    labelColor: "rgba(240,168,50,0.65)",
    valueFrom: "#fff8e0",
    valueTo: "#f0a832",
    tagBg: "rgba(240,168,50,0.08)",
    tagBorder: "rgba(240,168,50,0.2)",
    tagText: "#f5c96a",
    barFrom: "#c07a10",
    barTo: "#f0a832",
    glyph: "◇",
  },
  critical: {
    accent: "#ff4d4d",
    accentMid: "#c72020",
    accentAlpha: "rgba(255,77,77,0.07)",
    accentBorder: "rgba(255,77,77,0.2)",
    accentGlow: "rgba(255,77,77,0.12)",
    labelColor: "rgba(255,77,77,0.65)",
    valueFrom: "#ffe0e0",
    valueTo: "#ff4d4d",
    tagBg: "rgba(255,77,77,0.08)",
    tagBorder: "rgba(255,77,77,0.2)",
    tagText: "#ff8080",
    barFrom: "#c72020",
    barTo: "#ff4d4d",
    glyph: "▲",
  },
}

const TREND_ARROWS = { up: "↑", down: "↓", stable: "→" }

export default function SummaryCard({ title, value, description, variant = "info", trend, trendValue }: SummaryCardProps) {
  const v = VARIANTS[variant]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes sc-pulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes sc-ring  { 0%{transform:scale(1);opacity:0.5} 100%{transform:scale(2.6);opacity:0} }
        @keyframes sc-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .sc-card {
          position: relative; overflow: hidden;
          background: #0c0f15;
          border: 1px solid ${v.accentBorder};
          border-radius: 16px; padding: 22px 22px 20px;
          font-family: 'DM Sans', sans-serif;
          cursor: default;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .sc-card:hover { transform: translateY(-2px); border-color: ${v.accent}55; }
      `}</style>

      <div className="sc-card">
        {/* Top shine */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: `linear-gradient(90deg, transparent, ${v.accent}40, transparent)`,
        }} />

        {/* Corner glow */}
        <div style={{
          position: "absolute", top: -80, right: -60,
          width: 200, height: 200, borderRadius: "50%",
          background: `radial-gradient(circle, ${v.accentGlow}, transparent 70%)`,
          pointerEvents: "none",
        }} />

        {/* Live pulse dot */}
        <div style={{ position: "absolute", top: 18, right: 18 }}>
          <span style={{
            position: "absolute", inset: -5, borderRadius: "50%",
            border: `1px solid ${v.accent}`,
            animation: "sc-ring 2.8s ease-out infinite",
            display: "block",
          }} />
          <span style={{
            display: "block", width: 8, height: 8, borderRadius: "50%",
            background: v.accent, opacity: 0.9,
            animation: "sc-pulse 2.8s ease-in-out infinite",
          }} />
        </div>

        {/* Label row */}
        <div style={{
          display: "flex", alignItems: "center", gap: 7, marginBottom: 16,
        }}>
          <span style={{
            fontSize: 11, color: v.accent,
            animation: "sc-pulse 8s linear infinite",
          }}>
            {v.glyph}
          </span>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 500,
            letterSpacing: "1.6px", textTransform: "uppercase", color: v.labelColor,
          }}>
            {title}
          </span>
        </div>

        {/* Value — gradient text */}
        <div style={{
          fontFamily: "'Syne', sans-serif", fontSize: 44, fontWeight: 800,
          letterSpacing: "-3px", lineHeight: 1, marginBottom: 14,
          background: `linear-gradient(135deg, ${v.valueFrom} 30%, ${v.valueTo}99 100%)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          {value}
        </div>

        {/* Divider */}
        <div style={{
          height: 1, background: `linear-gradient(90deg, ${v.accentBorder}, transparent)`,
          marginBottom: 12,
        }} />

        {/* Bottom row */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
          <p style={{
            fontSize: 11.5, color: "rgba(148,163,184,0.55)", lineHeight: 1.6,
            margin: 0, flex: 1,
          }}>
            {description}
          </p>
          {trend && trendValue && (
            <div style={{
              display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
              background: v.tagBg, border: `1px solid ${v.tagBorder}`,
              borderRadius: 100, padding: "3px 10px",
              fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 500,
              color: v.tagText,
            }}>
              <span>{TREND_ARROWS[trend]}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
          background: "rgba(255,255,255,0.03)",
        }}>
          <div style={{
            height: "100%", width: "68%",
            background: `linear-gradient(90deg, ${v.barFrom}, ${v.barTo})`,
            borderRadius: "0 1px 1px 0",
          }} />
        </div>
      </div>
    </>
  )
}