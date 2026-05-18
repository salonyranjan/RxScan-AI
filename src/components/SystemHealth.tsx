"use client"

import { useState, useEffect, useRef } from "react"

// ─── Types ───────────────────────────────────────────────────
interface HealthMetric {
  name: string
  value: string
  status: "good" | "warning" | "critical"
  history?: number[]   // optional sparkline data 0–100
  unit?: string
}

// ─── Config ──────────────────────────────────────────────────
const STATUS = {
  good: {
    dot: "#10b981",
    dotGlow: "rgba(16,185,129,0.5)",
    badge: "rgba(16,185,129,0.08)",
    badgeBorder: "rgba(16,185,129,0.2)",
    badgeText: "#6ee7b7",
    bar: "linear-gradient(90deg,#059669,#10b981)",
    label: "Nominal",
    pulse: false,
  },
  warning: {
    dot: "#f59e0b",
    dotGlow: "rgba(245,158,11,0.5)",
    badge: "rgba(245,158,11,0.08)",
    badgeBorder: "rgba(245,158,11,0.2)",
    badgeText: "#fcd34d",
    bar: "linear-gradient(90deg,#d97706,#f59e0b)",
    label: "Degraded",
    pulse: true,
  },
  critical: {
    dot: "#ef4444",
    dotGlow: "rgba(239,68,68,0.5)",
    badge: "rgba(239,68,68,0.08)",
    badgeBorder: "rgba(239,68,68,0.2)",
    badgeText: "#fca5a5",
    bar: "linear-gradient(90deg,#dc2626,#ef4444)",
    label: "Critical",
    pulse: true,
  },
}

// ─── Sparkline ────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 56, h = 24, pad = 2
  if (!data.length) return null
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = h - pad - ((v - min) / range) * (h - pad * 2)
    return `${x},${y}`
  })
  const area = `M${pts[0]} L${pts.join(" L")} L${w - pad},${h} L${pad},${h} Z`
  return (
    <svg width={w} height={h} style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace("#","")})`} />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Individual metric row ────────────────────────────────────
function MetricRow({ metric, index }: { metric: HealthMetric; index: number }) {
  const cfg = STATUS[metric.status]
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLLIElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 70)
    return () => clearTimeout(t)
  }, [index])

  return (
    <li
      ref={ref}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 14px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 10,
        transition: "opacity 0.35s ease, transform 0.35s ease, border-color 0.2s",
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateX(-8px)",
        cursor: "default",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = `${cfg.dot}30`
        ;(e.currentTarget as HTMLElement).style.background = `${cfg.badge}`
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)"
        ;(e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"
      }}
    >
      {/* Status dot */}
      <div style={{ position: "relative", width: 8, height: 8, flexShrink: 0 }}>
        {cfg.pulse && (
          <span style={{
            position: "absolute", inset: -4, borderRadius: "50%",
            border: `1px solid ${cfg.dot}`,
            animation: "sh-ring 2s ease-out infinite",
          }} />
        )}
        <span style={{
          display: "block", width: 8, height: 8, borderRadius: "50%",
          background: cfg.dot,
          boxShadow: `0 0 6px ${cfg.dotGlow}`,
          animation: cfg.pulse ? "sh-pulse 2s ease-in-out infinite" : "none",
        }} />
      </div>

      {/* Name */}
      <span style={{
        flex: 1, fontSize: 12.5, fontWeight: 500,
        color: "rgba(203,213,225,0.85)", letterSpacing: "-0.1px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {metric.name}
      </span>

      {/* Sparkline */}
      {metric.history && (
        <Sparkline data={metric.history} color={cfg.dot} />
      )}

      {/* Value badge */}
      <span style={{
        fontSize: 12, fontWeight: 700, letterSpacing: "-0.3px",
        fontFamily: "'Geist Mono', monospace",
        background: cfg.badge, border: `1px solid ${cfg.badgeBorder}`,
        color: cfg.badgeText, borderRadius: 7, padding: "3px 10px",
        flexShrink: 0,
      }}>
        {metric.value}
      </span>
    </li>
  )
}

// ─── Overall status bar ───────────────────────────────────────
function OverallBar({ metrics }: { metrics: HealthMetric[] }) {
  const hasCritical = metrics.some(m => m.status === "critical")
  const hasWarning  = metrics.some(m => m.status === "warning")
  const status = hasCritical ? "critical" : hasWarning ? "warning" : "good"
  const cfg = STATUS[status]
  const goodPct = Math.round((metrics.filter(m => m.status === "good").length / metrics.length) * 100)

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: "rgba(100,116,139,0.7)" }}>
          System Health
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.5px",
          background: cfg.badge, border: `1px solid ${cfg.badgeBorder}`,
          color: cfg.badgeText, borderRadius: 100, padding: "2px 10px",
          fontFamily: "'Geist Mono', monospace",
        }}>
          {goodPct}% nominal
        </span>
      </div>
      <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${goodPct}%`, background: cfg.bar, borderRadius: 2,
          transition: "width 0.8s cubic-bezier(.4,0,.2,1)",
        }} />
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────
export default function SystemHealth() {
  const metrics: HealthMetric[] = [
    {
      name: "Server Uptime",
      value: "99.98%",
      status: "good",
      history: [98, 99, 100, 99, 100, 100, 99, 100, 100, 99],
    },
    {
      name: "Avg Response Time",
      value: "214ms",
      status: "good",
      history: [180, 210, 195, 220, 200, 214, 208, 215, 210, 214],
    },
    {
      name: "Error Rate",
      value: "0.5%",
      status: "warning",
      history: [0.1, 0.2, 0.1, 0.3, 0.4, 0.3, 0.5, 0.6, 0.5, 0.5],
    },
    {
      name: "Database Latency",
      value: "38ms",
      status: "good",
      history: [30, 35, 32, 38, 36, 40, 37, 35, 38, 38],
    },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Geist+Mono:wght@500;700&display=swap');
        @keyframes sh-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes sh-ring  { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.5);opacity:0} }
      `}</style>

      <div style={{
        background: "linear-gradient(160deg,#0c0e14 0%,#0a0c11 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16, padding: "20px 18px 16px",
        position: "relative", overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* Ambient top shimmer */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)",
        }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, color: "#10b981",
            }}>
              ⬡
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", letterSpacing: "-0.3px" }}>
              System Health
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%", background: "#10b981",
              display: "inline-block", animation: "sh-pulse 2.5s ease-in-out infinite",
              boxShadow: "0 0 6px rgba(16,185,129,0.6)",
            }} />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: "rgba(100,116,139,0.7)" }}>
              Live
            </span>
          </div>
        </div>

        {/* Overall bar */}
        <OverallBar metrics={metrics} />

        {/* Metric rows */}
        <ul style={{ display: "flex", flexDirection: "column", gap: 6, listStyle: "none", padding: 0, margin: 0 }}>
          {metrics.map((m, i) => (
            <MetricRow key={m.name} metric={m} index={i} />
          ))}
        </ul>

        {/* Footer timestamp */}
        <div style={{
          marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)",
          display: "flex", justifyContent: "space-between",
          fontSize: 10, color: "rgba(100,116,139,0.45)", letterSpacing: "0.3px",
          fontFamily: "'Geist Mono', monospace",
        }}>
          <span>4 services monitored</span>
          <span>Updated just now</span>
        </div>
      </div>
    </>
  )
}