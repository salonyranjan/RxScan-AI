"use client"

// ─── Types ───────────────────────────────────────────────────
interface SummaryCardProps {
  title: string
  value: string | number
  description: string
  variant?: "primary" | "info" | "caution" | "critical"
  trend?: "up" | "down" | "stable"
  trendValue?: string
}

// ─── Variant config ──────────────────────────────────────────
const VARIANTS = {
  primary: {
    accent: "#22d3ee",
    accentDim: "rgba(34,211,238,0.08)",
    accentBorder: "rgba(34,211,238,0.18)",
    accentGlow: "rgba(34,211,238,0.12)",
    label: "rgba(34,211,238,0.7)",
    value: "#e0f9ff",
    desc: "rgba(34,211,238,0.5)",
    bar: "linear-gradient(90deg, #06b6d4, #22d3ee)",
    icon: "◈",
    tagBg: "rgba(34,211,238,0.07)",
    tagBorder: "rgba(34,211,238,0.2)",
    tagText: "#67e8f9",
  },
  info: {
    accent: "#10b981",
    accentDim: "rgba(16,185,129,0.08)",
    accentBorder: "rgba(16,185,129,0.18)",
    accentGlow: "rgba(16,185,129,0.1)",
    label: "rgba(16,185,129,0.7)",
    value: "#ecfdf5",
    desc: "rgba(16,185,129,0.5)",
    bar: "linear-gradient(90deg, #059669, #10b981)",
    icon: "◉",
    tagBg: "rgba(16,185,129,0.07)",
    tagBorder: "rgba(16,185,129,0.2)",
    tagText: "#6ee7b7",
  },
  caution: {
    accent: "#f59e0b",
    accentDim: "rgba(245,158,11,0.08)",
    accentBorder: "rgba(245,158,11,0.18)",
    accentGlow: "rgba(245,158,11,0.1)",
    label: "rgba(245,158,11,0.7)",
    value: "#fffbeb",
    desc: "rgba(245,158,11,0.5)",
    bar: "linear-gradient(90deg, #d97706, #f59e0b)",
    icon: "◇",
    tagBg: "rgba(245,158,11,0.07)",
    tagBorder: "rgba(245,158,11,0.2)",
    tagText: "#fcd34d",
  },
  critical: {
    accent: "#ef4444",
    accentDim: "rgba(239,68,68,0.08)",
    accentBorder: "rgba(239,68,68,0.18)",
    accentGlow: "rgba(239,68,68,0.1)",
    label: "rgba(239,68,68,0.7)",
    value: "#fff1f1",
    desc: "rgba(239,68,68,0.5)",
    bar: "linear-gradient(90deg, #dc2626, #ef4444)",
    icon: "◆",
    tagBg: "rgba(239,68,68,0.07)",
    tagBorder: "rgba(239,68,68,0.2)",
    tagText: "#fca5a5",
  },
}

// ─── Trend arrow ─────────────────────────────────────────────
const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
  if (trend === "up")     return <span style={{ fontSize: 11 }}>↑</span>
  if (trend === "down")   return <span style={{ fontSize: 11 }}>↓</span>
  return <span style={{ fontSize: 11 }}>→</span>
}

// ─── Main component ──────────────────────────────────────────
export default function SummaryCard({
  title,
  value,
  description,
  variant = "info",
  trend,
  trendValue,
}: SummaryCardProps) {
  const cfg = VARIANTS[variant]

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist+Mono:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');
    .sc-root {
      position: relative; overflow: hidden;
      background: #0a0b0f;
      border: 1px solid ${cfg.accentBorder};
      border-radius: 16px;
      padding: 22px 22px 18px;
      font-family: 'DM Sans', sans-serif;
      cursor: default;
      transition: border-color 0.2s ease, transform 0.2s ease;
    }
    .sc-root:hover {
      border-color: ${cfg.accent}40;
      transform: translateY(-2px);
    }
    .sc-shine {
      position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent 0%, ${cfg.accent}30 40%, ${cfg.accent}50 50%, ${cfg.accent}30 60%, transparent 100%);
    }
    .sc-glow {
      position: absolute; top: -60px; right: -40px;
      width: 160px; height: 160px; border-radius: 50%;
      background: radial-gradient(circle, ${cfg.accentGlow} 0%, transparent 70%);
      pointer-events: none;
    }
    .sc-label {
      display: flex; align-items: center; gap: 7px;
      font-size: 10px; font-weight: 600; letter-spacing: 1.4px;
      text-transform: uppercase; color: ${cfg.label};
      margin-bottom: 14px;
    }
    .sc-icon {
      font-size: 10px; color: ${cfg.accent};
      animation: sc-spin 8s linear infinite;
    }
    @keyframes sc-spin { to { transform: rotate(360deg); } }
    .sc-value {
      font-family: 'Geist Mono', monospace;
      font-size: 42px; font-weight: 600;
      color: ${cfg.value};
      letter-spacing: -2px; line-height: 1;
      margin-bottom: 12px;
      background: linear-gradient(135deg, ${cfg.value} 30%, ${cfg.accent}80 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .sc-divider {
      height: 1px; background: linear-gradient(90deg, ${cfg.accentBorder}, transparent);
      margin: 12px 0;
    }
    .sc-bottom { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .sc-desc {
      font-size: 11.5px; color: rgba(148,163,184,0.6); line-height: 1.5;
      flex: 1;
    }
    .sc-trend {
      display: flex; align-items: center; gap: 4px;
      background: ${cfg.tagBg}; border: 1px solid ${cfg.tagBorder};
      border-radius: 100px; padding: 3px 9px; flex-shrink: 0;
      font-size: 11px; font-weight: 600; color: ${cfg.tagText};
      font-family: 'Geist Mono', monospace;
    }
    .sc-bar-wrap {
      position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
      background: rgba(255,255,255,0.03);
    }
    .sc-bar-fill {
      height: 100%; width: 65%;
      background: ${cfg.bar};
      border-radius: 0 1px 1px 0;
    }
    .sc-pulse-ring {
      position: absolute; top: 18px; right: 18px;
      width: 8px; height: 8px;
    }
    .sc-pulse-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: ${cfg.accent}; opacity: 0.9;
      animation: sc-pulse 2.5s ease-in-out infinite;
    }
    .sc-pulse-ring-anim {
      position: absolute; inset: -4px; border-radius: 50%;
      border: 1px solid ${cfg.accent};
      animation: sc-ring 2.5s ease-out infinite;
    }
    @keyframes sc-pulse { 0%,100%{opacity:0.9} 50%{opacity:0.4} }
    @keyframes sc-ring  { 0%{transform:scale(1);opacity:0.5} 100%{transform:scale(2.4);opacity:0} }
  `

  return (
    <>
      <style>{css}</style>
      <div className="sc-root">
        <div className="sc-shine" />
        <div className="sc-glow" />

        {/* Live pulse dot */}
        <div className="sc-pulse-ring">
          <div className="sc-pulse-ring-anim" />
          <div className="sc-pulse-dot" />
        </div>

        {/* Label */}
        <div className="sc-label">
          <span className="sc-icon">{cfg.icon}</span>
          {title}
        </div>

        {/* Value */}
        <div className="sc-value">{value}</div>

        <div className="sc-divider" />

        {/* Bottom row */}
        <div className="sc-bottom">
          <p className="sc-desc">{description}</p>
          {trend && trendValue && (
            <div className="sc-trend">
              <TrendIcon trend={trend} />
              {trendValue}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="sc-bar-wrap">
          <div className="sc-bar-fill" />
        </div>
      </div>
    </>
  )
}