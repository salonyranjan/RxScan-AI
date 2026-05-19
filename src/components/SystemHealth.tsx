"use client"

import { useState, useEffect, useRef } from "react"

interface HealthMetric {
  name: string
  value: string
  status: "good" | "warning" | "critical"
  history?: number[]
  unit?: string
}

const S = {
  good: {
    dot: "#00c896", glow: "rgba(0,200,150,0.6)",
    badge: "rgba(0,200,150,0.07)", badgeBorder: "rgba(0,200,150,0.2)", badgeText: "#4debb8",
    bar: "linear-gradient(90deg,#00956f,#00c896)", label: "Nominal", pulse: false,
    rowHoverBg: "rgba(0,200,150,0.04)", rowHoverBorder: "rgba(0,200,150,0.15)",
  },
  warning: {
    dot: "#f0a832", glow: "rgba(240,168,50,0.6)",
    badge: "rgba(240,168,50,0.07)", badgeBorder: "rgba(240,168,50,0.2)", badgeText: "#f5c96a",
    bar: "linear-gradient(90deg,#c07a10,#f0a832)", label: "Degraded", pulse: true,
    rowHoverBg: "rgba(240,168,50,0.04)", rowHoverBorder: "rgba(240,168,50,0.15)",
  },
  critical: {
    dot: "#ff4d4d", glow: "rgba(255,77,77,0.6)",
    badge: "rgba(255,77,77,0.07)", badgeBorder: "rgba(255,77,77,0.2)", badgeText: "#ff8080",
    bar: "linear-gradient(90deg,#c72020,#ff4d4d)", label: "Critical", pulse: true,
    rowHoverBg: "rgba(255,77,77,0.04)", rowHoverBorder: "rgba(255,77,77,0.15)",
  },
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const W = 54, H = 22, P = 2
  if (data.length < 2) return null
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1
  const pts = data.map((v, i) => {
    const x = P + (i / (data.length - 1)) * (W - P * 2)
    const y = H - P - ((v - mn) / rng) * (H - P * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const id = `sg${color.replace(/[^a-z0-9]/gi,"")}`
  return (
    <svg width={W} height={H} style={{ flexShrink: 0, opacity: 0.85 }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path
        d={`M${pts[0]} L${pts.join(" L")} L${(W-P).toFixed(1)},${H} L${P},${H} Z`}
        fill={`url(#${id})`}
      />
      <polyline
        points={pts.join(" ")} fill="none"
        stroke={color} strokeWidth="1.4"
        strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Last point dot */}
      {(() => {
        const [lx, ly] = pts[pts.length - 1].split(",").map(Number)
        return <circle cx={lx} cy={ly} r="2.5" fill={color} opacity="0.9"/>
      })()}
    </svg>
  )
}

function MetricRow({ m, idx }: { m: HealthMetric; idx: number }) {
  const c = S[m.status]
  const [vis, setVis] = useState(false)
  const ref = useRef<HTMLLIElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setVis(true), idx * 80 + 40)
    return () => clearTimeout(t)
  }, [idx])

  return (
    <li
      ref={ref}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 13px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 10,
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : "translateY(8px)",
        transition: "opacity 0.32s ease, transform 0.32s ease, border-color 0.18s, background 0.18s",
        cursor: "default", listStyle: "none",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = c.rowHoverBorder
        el.style.background = c.rowHoverBg
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = "rgba(255,255,255,0.05)"
        el.style.background = "rgba(255,255,255,0.02)"
      }}
    >
      {/* Status dot */}
      <div style={{ width: 8, height: 8, position: "relative", flexShrink: 0 }}>
        {c.pulse && (
          <span style={{
            position: "absolute", inset: -4, borderRadius: "50%",
            border: `1px solid ${c.dot}`,
            animation: "sh-ring 2.2s ease-out infinite",
            display: "block",
          }} />
        )}
        <span style={{
          display: "block", width: 8, height: 8, borderRadius: "50%",
          background: c.dot, boxShadow: `0 0 7px ${c.glow}`,
          animation: c.pulse ? "sh-pulse 2.2s ease-in-out infinite" : "none",
        }} />
      </div>

      {/* Name */}
      <span style={{
        flex: 1, fontSize: 12.5, fontWeight: 400,
        color: "rgba(203,213,225,0.8)", letterSpacing: "-0.1px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {m.name}
      </span>

      {/* Sparkline */}
      {m.history && <Sparkline data={m.history} color={c.dot} />}

      {/* Value badge */}
      <span style={{
        fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 500,
        letterSpacing: "-0.2px", flexShrink: 0,
        background: c.badge, border: `1px solid ${c.badgeBorder}`,
        color: c.badgeText, borderRadius: 7, padding: "3px 10px",
      }}>
        {m.value}
      </span>
    </li>
  )
}

export default function SystemHealth() {
  const metrics: HealthMetric[] = [
    { name: "Server Uptime",       value: "99.98%", status: "good",    history: [98,99,100,99,100,100,99,100,100,99] },
    { name: "Avg Response Time",   value: "214ms",  status: "good",    history: [180,210,195,220,200,214,208,215,210,214] },
    { name: "Error Rate",          value: "0.5%",   status: "warning", history: [0.1,0.2,0.1,0.3,0.4,0.3,0.5,0.6,0.5,0.5] },
    { name: "Database Latency",    value: "38ms",   status: "good",    history: [30,35,32,38,36,40,37,35,38,38] },
  ]

  const goodPct = Math.round(metrics.filter(m => m.status === "good").length / metrics.length * 100)
  const hasCrit = metrics.some(m => m.status === "critical")
  const hasWarn = metrics.some(m => m.status === "warning")
  const overallStatus = hasCrit ? "critical" : hasWarn ? "warning" : "good"
  const oc = S[overallStatus]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500&display=swap');
        @keyframes sh-pulse { 0%,100%{opacity:1} 50%{opacity:0.28} }
        @keyframes sh-ring  { 0%{transform:scale(1);opacity:0.55} 100%{transform:scale(2.8);opacity:0} }
        @keyframes sh-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      <div style={{
        background: "#0c0f15", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16, padding: "20px 18px 16px",
        position: "relative", overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* Top shimmer */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)",
        }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: "rgba(0,200,150,0.07)", border: "1px solid rgba(0,200,150,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, color: "#00c896",
            }}>
              ⬡
            </div>
            <span style={{
              fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700,
              color: "#e8edf4", letterSpacing: "-0.4px",
            }}>
              System Health
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%", background: oc.dot,
              boxShadow: `0 0 8px ${oc.glow}`, display: "inline-block",
              animation: "sh-blink 2.5s ease-in-out infinite",
            }} />
            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 500,
              letterSpacing: "1.2px", textTransform: "uppercase",
              color: "rgba(100,116,139,0.65)",
            }}>
              Live
            </span>
          </div>
        </div>

        {/* System health bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 500,
              letterSpacing: "1.2px", textTransform: "uppercase",
              color: "rgba(100,116,139,0.6)",
            }}>
              Overall Status
            </span>
            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 500,
              background: oc.badge, border: `1px solid ${oc.badgeBorder}`,
              color: oc.badgeText, borderRadius: 100, padding: "2px 10px",
            }}>
              {goodPct}% nominal
            </span>
          </div>
          <div style={{ height: 3, background: "rgba(255,255,255,0.04)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${goodPct}%`, background: oc.bar, borderRadius: 2,
              transition: "width 0.9s cubic-bezier(.4,0,.2,1)",
            }} />
          </div>
        </div>

        {/* Metric rows */}
        <ul style={{ display: "flex", flexDirection: "column", gap: 6, padding: 0, margin: 0 }}>
          {metrics.map((m, i) => <MetricRow key={m.name} m={m} idx={i} />)}
        </ul>

        {/* Footer */}
        <div style={{
          marginTop: 14, paddingTop: 12,
          borderTop: "1px solid rgba(255,255,255,0.04)",
          display: "flex", justifyContent: "space-between",
          fontFamily: "'DM Mono', monospace", fontSize: 10,
          color: "rgba(100,116,139,0.4)", letterSpacing: "0.3px",
        }}>
          <span>{metrics.length} services monitored</span>
          <span>Updated just now</span>
        </div>
      </div>
    </>
  )
}