"use client"

import { useState } from "react"

// ─── Types ───────────────────────────────────────────────────
interface Interaction {
  interactingDrug: string
  severity: string
  description: string
}

interface AlertProps {
  interactions: Array<{ medication: string; interactions: Interaction[] }>
}

// ─── Config ──────────────────────────────────────────────────
const SEVERITY_CONFIG: Record<string, {
  label: string
  rank: number
  barColor: string
  badgeBg: string
  badgeBorder: string
  badgeText: string
  iconBg: string
  iconBorder: string
  iconColor: string
  cardBorder: string
  cardAccent: string
  dotColor: string
}> = {
  high: {
    label: "Critical",
    rank: 3,
    barColor: "#ef4444",
    badgeBg: "rgba(239,68,68,0.08)",
    badgeBorder: "rgba(239,68,68,0.25)",
    badgeText: "#f87171",
    iconBg: "rgba(239,68,68,0.08)",
    iconBorder: "rgba(239,68,68,0.2)",
    iconColor: "#ef4444",
    cardBorder: "rgba(239,68,68,0.18)",
    cardAccent: "#ef4444",
    dotColor: "#ef4444",
  },
  moderate: {
    label: "Moderate",
    rank: 2,
    barColor: "#f59e0b",
    badgeBg: "rgba(245,158,11,0.08)",
    badgeBorder: "rgba(245,158,11,0.25)",
    badgeText: "#fbbf24",
    iconBg: "rgba(245,158,11,0.08)",
    iconBorder: "rgba(245,158,11,0.2)",
    iconColor: "#f59e0b",
    cardBorder: "rgba(245,158,11,0.18)",
    cardAccent: "#f59e0b",
    dotColor: "#f59e0b",
  },
  low: {
    label: "Minor",
    rank: 1,
    barColor: "#3b82f6",
    badgeBg: "rgba(59,130,246,0.08)",
    badgeBorder: "rgba(59,130,246,0.25)",
    badgeText: "#60a5fa",
    iconBg: "rgba(59,130,246,0.08)",
    iconBorder: "rgba(59,130,246,0.2)",
    iconColor: "#3b82f6",
    cardBorder: "rgba(59,130,246,0.18)",
    cardAccent: "#3b82f6",
    dotColor: "#3b82f6",
  },
}

const getSeverityConfig = (sev: string) =>
  SEVERITY_CONFIG[sev.toLowerCase()] ?? SEVERITY_CONFIG.low

// ─── Icons ───────────────────────────────────────────────────
const IconCritical = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1L13 12H1L7 1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M7 5.5V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="7" cy="10" r="0.7" fill="currentColor"/>
  </svg>
)
const IconCaution = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M7 4.5V7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="7" cy="9.5" r="0.7" fill="currentColor"/>
  </svg>
)
const IconInfo = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M7 6.5V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="7" cy="4.5" r="0.7" fill="currentColor"/>
  </svg>
)
const IconChevron = ({ open }: { open: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s ease" }}>
    <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconPill = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <rect x="1.5" y="4" width="10" height="5" rx="2.5" stroke="currentColor" strokeWidth="1.3"/>
    <line x1="6.5" y1="4" x2="6.5" y2="9" stroke="currentColor" strokeWidth="1.3"/>
  </svg>
)

const SeverityIcon = ({ sev }: { sev: string }) => {
  const s = sev.toLowerCase()
  if (s === "high") return <IconCritical />
  if (s === "moderate") return <IconCaution />
  return <IconInfo />
}

// ─── Sub-components ──────────────────────────────────────────
function SeverityBar({ severity }: { severity: string }) {
  const cfg = getSeverityConfig(severity)
  const widths: Record<number, string> = { 3: "100%", 2: "66%", 1: "33%" }
  const w = widths[cfg.rank] ?? "33%"
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 44, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: w, background: cfg.barColor, borderRadius: 2,
          transition: "width 0.6s cubic-bezier(.4,0,.2,1)" }} />
      </div>
    </div>
  )
}

function InteractionRow({ item, index }: { item: Interaction; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = getSeverityConfig(item.severity)

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${cfg.cardBorder}`,
        borderRadius: 10,
        overflow: "hidden",
        animationDelay: `${index * 60}ms`,
        animationFillMode: "both",
      }}
      className="alert-row-anim"
    >
      {/* Row header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          padding: "11px 14px", background: "transparent", border: "none",
          cursor: "pointer", textAlign: "left", fontFamily: "inherit",
        }}
      >
        {/* Severity icon */}
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: cfg.iconBg, border: `1px solid ${cfg.iconBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: cfg.iconColor,
        }}>
          <SeverityIcon sev={item.severity} />
        </div>

        {/* Drug name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", letterSpacing: "-0.2px" }}>
              {item.interactingDrug}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.7px", textTransform: "uppercase",
              background: cfg.badgeBg, border: `1px solid ${cfg.badgeBorder}`,
              color: cfg.badgeText, borderRadius: 100, padding: "2px 8px",
            }}>
              {cfg.label}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            <SeverityBar severity={item.severity} />
            <span style={{ fontSize: 10, color: "rgba(148,163,184,0.5)" }}>
              {cfg.rank === 3 ? "Seek medical advice" : cfg.rank === 2 ? "Monitor closely" : "Low risk"}
            </span>
          </div>
        </div>

        {/* Expand chevron */}
        <div style={{ color: "rgba(148,163,184,0.4)", flexShrink: 0 }}>
          <IconChevron open={expanded} />
        </div>
      </button>

      {/* Expanded description */}
      <div style={{
        overflow: "hidden",
        maxHeight: expanded ? 200 : 0,
        transition: "max-height 0.3s cubic-bezier(.4,0,.2,1)",
      }}>
        <div style={{
          padding: "0 14px 14px 52px",
          borderTop: `1px solid rgba(255,255,255,0.04)`,
          paddingTop: 10,
        }}>
          <p style={{
            fontSize: 12, color: "rgba(148,163,184,0.85)", lineHeight: 1.65,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {item.description}
          </p>
        </div>
      </div>
    </div>
  )
}

function MedicationCard({ med, index }: { item: typeof med; index: number; med: AlertProps["interactions"][number] }) {
  const [collapsed, setCollapsed] = useState(false)

  // Sort: critical first
  const sorted = [...med.interactions].sort(
    (a, b) => (getSeverityConfig(b.severity).rank) - (getSeverityConfig(a.severity).rank)
  )

  const highestSev = sorted[0] ? getSeverityConfig(sorted[0].severity) : getSeverityConfig("low")
  const critCount  = sorted.filter(i => i.severity.toLowerCase() === "high").length
  const modCount   = sorted.filter(i => i.severity.toLowerCase() === "moderate").length

  return (
    <div
      style={{
        background: "linear-gradient(160deg, #0f1117 0%, #0d0e13 100%)",
        border: `1px solid rgba(255,255,255,0.07)`,
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        animationDelay: `${index * 100}ms`,
        animationFillMode: "both",
      }}
      className="med-card-anim"
    >
      {/* Left accent bar */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
        background: `linear-gradient(180deg, ${highestSev.cardAccent} 0%, transparent 100%)`,
        borderRadius: "16px 0 0 16px",
      }} />

      {/* Card header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "16px 18px 14px 20px",
        borderBottom: collapsed ? "none" : "1px solid rgba(255,255,255,0.05)",
      }}>
        {/* Pill icon */}
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: highestSev.iconBg, border: `1px solid ${highestSev.iconBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: highestSev.iconColor,
        }}>
          <IconPill />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h3 style={{
              fontSize: 15, fontWeight: 700, color: "#f8fafc",
              letterSpacing: "-0.4px", margin: 0,
              fontFamily: "'Syne', sans-serif",
            }}>
              {med.medication}
            </h3>
            {/* Count chips */}
            {critCount > 0 && (
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.5px",
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                color: "#f87171", borderRadius: 100, padding: "2px 8px",
              }}>
                {critCount} critical
              </span>
            )}
            {modCount > 0 && (
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.5px",
                background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
                color: "#fbbf24", borderRadius: 100, padding: "2px 8px",
              }}>
                {modCount} moderate
              </span>
            )}
          </div>
          <p style={{ fontSize: 11, color: "rgba(100,116,139,0.8)", margin: "3px 0 0", letterSpacing: "0.3px" }}>
            {med.interactions.length} interaction{med.interactions.length !== 1 ? "s" : ""} detected
          </p>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(148,163,184,0.5)", cursor: "pointer",
          }}
        >
          <IconChevron open={!collapsed} />
        </button>
      </div>

      {/* Interactions list */}
      <div style={{
        overflow: "hidden",
        maxHeight: collapsed ? 0 : 1000,
        transition: "max-height 0.35s cubic-bezier(.4,0,.2,1)",
      }}>
        <div style={{ padding: "12px 16px 16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sorted.map((item, i) => (
              <InteractionRow key={i} item={item} index={i} />
            ))}
          </div>

          {/* Footer note */}
          <div style={{
            marginTop: 12, paddingTop: 12,
            borderTop: "1px solid rgba(255,255,255,0.04)",
            display: "flex", alignItems: "flex-start", gap: 8,
          }}>
            <div style={{
              width: 14, height: 14, marginTop: 1, flexShrink: 0,
              color: "rgba(100,116,139,0.5)",
            }}>
              <IconInfo />
            </div>
            <p style={{ fontSize: 10, color: "rgba(100,116,139,0.55)", lineHeight: 1.6, margin: 0 }}>
              Consult your pharmacist or prescribing physician before adjusting any medications based on these interactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────
export default function Alerts({ interactions }: AlertProps) {
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
    .alert-row-anim { animation: row-in 0.3s cubic-bezier(.4,0,.2,1) both; }
    .med-card-anim  { animation: card-in 0.4s cubic-bezier(.4,0,.2,1) both; }
    @keyframes row-in  { from { opacity:0; transform:translateX(-6px); } to { opacity:1; transform:none; } }
    @keyframes card-in { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
  `

  if (!interactions || interactions.length === 0) return null

  return (
    <>
      <style>{css}</style>
      <div style={{ fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Header row */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 4,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%", background: "#ef4444",
              boxShadow: "0 0 8px rgba(239,68,68,0.6)",
              animation: "pulse-dot 2s ease-in-out infinite",
            }} />
            <style>{`@keyframes pulse-dot { 0%,100%{opacity:1}50%{opacity:0.4} }`}</style>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "1.2px",
              textTransform: "uppercase", color: "rgba(148,163,184,0.6)",
            }}>
              Drug Interactions
            </span>
          </div>
          <span style={{
            fontSize: 11, color: "rgba(100,116,139,0.5)", letterSpacing: "0.3px",
          }}>
            {interactions.reduce((t, m) => t + m.interactions.length, 0)} flagged
          </span>
        </div>

        {/* Cards */}
        {interactions.map((med, idx) => (
          <MedicationCard key={idx} med={med} index={idx} item={med} />
        ))}
      </div>
    </>
  )
}