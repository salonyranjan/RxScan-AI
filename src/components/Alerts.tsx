"use client"

import { useState } from "react"

interface Interaction {
  interactingDrug: string
  severity: string
  description: string
}

interface AlertProps {
  interactions: Array<{ medication: string; interactions: Interaction[] }>
}

const SEV: Record<string, {
  rank: number; label: string; glyph: string;
  accent: string; accentAlpha: string; accentBorder: string;
  textColor: string; barPct: string;
}> = {
  high: {
    rank: 3, label: "Critical", glyph: "▲", barPct: "100%",
    accent: "#ff4d4d", accentAlpha: "rgba(255,77,77,0.07)",
    accentBorder: "rgba(255,77,77,0.18)", textColor: "#ff8080",
  },
  moderate: {
    rank: 2, label: "Moderate", glyph: "◆", barPct: "66%",
    accent: "#f0a832", accentAlpha: "rgba(240,168,50,0.07)",
    accentBorder: "rgba(240,168,50,0.18)", textColor: "#f5c96a",
  },
  low: {
    rank: 1, label: "Minor", glyph: "●", barPct: "33%",
    accent: "#3d85f7", accentAlpha: "rgba(61,133,247,0.07)",
    accentBorder: "rgba(61,133,247,0.18)", textColor: "#7aaaf7",
  },
}

const cfg = (s: string) => SEV[s.toLowerCase()] ?? SEV.low

function InteractionRow({ item, i }: { item: Interaction; i: number }) {
  const [open, setOpen] = useState(false)
  const c = cfg(item.severity)

  return (
    <div style={{
      border: `1px solid ${open ? c.accentBorder : "rgba(255,255,255,0.05)"}`,
      borderRadius: 10, overflow: "hidden",
      background: open ? c.accentAlpha : "transparent",
      transition: "border-color 0.2s, background 0.2s",
      animation: `rowIn 0.3s ${i * 55}ms both`,
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 11,
          padding: "11px 14px", background: "none", border: "none",
          cursor: "pointer", fontFamily: "'DM Mono', monospace", textAlign: "left",
        }}
      >
        {/* Severity glyph */}
        <div style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          border: `1px solid ${c.accentBorder}`, background: c.accentAlpha,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, color: c.accent,
        }}>
          {c.glyph}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <span style={{
              fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700,
              color: "#f0f4f8", letterSpacing: "-0.2px",
            }}>
              {item.interactingDrug}
            </span>
            <span style={{
              fontSize: 9, fontWeight: 600, letterSpacing: "1.2px",
              textTransform: "uppercase", color: c.textColor,
              background: c.accentAlpha, border: `1px solid ${c.accentBorder}`,
              borderRadius: 100, padding: "2px 8px",
            }}>
              {c.label}
            </span>
          </div>
          {/* Severity bar */}
          <div style={{
            height: 2, width: 52, background: "rgba(255,255,255,0.05)",
            borderRadius: 2, overflow: "hidden",
          }}>
            <div style={{
              height: "100%", width: c.barPct,
              background: c.accent, borderRadius: 2,
            }} />
          </div>
        </div>

        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{ flexShrink: 0, color: "rgba(148,163,184,0.35)", transition: "transform 0.22s", transform: open ? "rotate(180deg)" : "none" }}
        >
          <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Expanded */}
      <div style={{ maxHeight: open ? 180 : 0, overflow: "hidden", transition: "max-height 0.28s cubic-bezier(.4,0,.2,1)" }}>
        <p style={{
          margin: 0, padding: "0 14px 13px 55px",
          fontSize: 11.5, color: "rgba(148,163,184,0.75)", lineHeight: 1.7,
          fontFamily: "'DM Sans', sans-serif",
          borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 10,
        }}>
          {item.description}
        </p>
      </div>
    </div>
  )
}

function MedCard({ med, idx }: { med: AlertProps["interactions"][number]; idx: number }) {
  const [closed, setClosed] = useState(false)
  const sorted = [...med.interactions].sort((a, b) => cfg(b.severity).rank - cfg(a.severity).rank)
  const top = sorted[0] ? cfg(sorted[0].severity) : cfg("low")
  const critN = sorted.filter(i => i.severity.toLowerCase() === "high").length
  const modN  = sorted.filter(i => i.severity.toLowerCase() === "moderate").length

  return (
    <div style={{
      background: "#0c0f15", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16, overflow: "hidden", position: "relative",
      animation: `cardIn 0.4s ${idx * 90}ms both`,
    }}>
      {/* Left accent stripe */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 2,
        background: `linear-gradient(180deg, ${top.accent} 0%, transparent 100%)`,
      }} />

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "16px 16px 15px 18px",
        borderBottom: closed ? "none" : "1px solid rgba(255,255,255,0.05)",
      }}>
        {/* Drug letter avatar */}
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: top.accentAlpha, border: `1px solid ${top.accentBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: top.accent,
        }}>
          {med.medication.charAt(0)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 4 }}>
            <h3 style={{
              fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700,
              color: "#f0f4f8", margin: 0, letterSpacing: "-0.4px",
            }}>
              {med.medication}
            </h3>
            {critN > 0 && (
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase",
                background: "rgba(255,77,77,0.08)", border: "1px solid rgba(255,77,77,0.2)",
                color: "#ff8080", borderRadius: 100, padding: "2px 8px",
              }}>{critN}× critical</span>
            )}
            {modN > 0 && (
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase",
                background: "rgba(240,168,50,0.08)", border: "1px solid rgba(240,168,50,0.2)",
                color: "#f5c96a", borderRadius: 100, padding: "2px 8px",
              }}>{modN}× moderate</span>
            )}
          </div>
          <p style={{
            margin: 0, fontFamily: "'DM Mono', monospace", fontSize: 10,
            color: "rgba(100,116,139,0.7)", letterSpacing: "0.3px",
          }}>
            {med.interactions.length} interaction{med.interactions.length !== 1 ? "s" : ""} flagged
          </p>
        </div>

        <button
          onClick={() => setClosed(c => !c)}
          style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "rgba(148,163,184,0.4)",
          }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none"
            style={{ transition: "transform 0.22s", transform: closed ? "rotate(-90deg)" : "none" }}
          >
            <path d="M1.5 4L5.5 8L9.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Interaction list */}
      <div style={{ maxHeight: closed ? 0 : 800, overflow: "hidden", transition: "max-height 0.35s cubic-bezier(.4,0,.2,1)" }}>
        <div style={{ padding: "12px 14px 14px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {sorted.map((item, i) => <InteractionRow key={i} item={item} i={i} />)}
          </div>
          <div style={{
            marginTop: 12, paddingTop: 11,
            borderTop: "1px solid rgba(255,255,255,0.04)",
            display: "flex", gap: 8,
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, marginTop: 1, color: "rgba(100,116,139,0.4)" }}>
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M6 5.5V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <circle cx="6" cy="3.5" r="0.6" fill="currentColor"/>
            </svg>
            <p style={{ margin: 0, fontSize: 10, color: "rgba(100,116,139,0.5)", lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>
              Consult your pharmacist before adjusting any medication based on these interactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Alerts({ interactions }: AlertProps) {
  if (!interactions?.length) return null

  const totalFlags = interactions.reduce((t, m) => t + m.interactions.length, 0)
  const hasCritical = interactions.some(m => m.interactions.some(i => i.severity.toLowerCase() === "high"))

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500&display=swap');
        @keyframes rowIn  { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:none; } }
        @keyframes cardIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
        @keyframes dotBlink { 0%,100%{opacity:1} 50%{opacity:0.25} }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, fontFamily: "'DM Sans', sans-serif" }}>
        {/* Header bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: hasCritical ? "#ff4d4d" : "#f0a832",
              boxShadow: `0 0 10px ${hasCritical ? "rgba(255,77,77,0.7)" : "rgba(240,168,50,0.7)"}`,
              animation: "dotBlink 2s ease-in-out infinite",
            }} />
            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 500,
              letterSpacing: "1.8px", textTransform: "uppercase", color: "rgba(148,163,184,0.5)",
            }}>
              Drug Interactions
            </span>
          </div>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 10,
            color: "rgba(100,116,139,0.5)", letterSpacing: "0.5px",
          }}>
            {totalFlags} flagged
          </span>
        </div>

        {/* Cards */}
        {interactions.map((med, idx) => <MedCard key={idx} med={med} idx={idx} />)}
      </div>
    </>
  )
}