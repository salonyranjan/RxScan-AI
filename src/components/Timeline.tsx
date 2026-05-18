"use client"

// ─── Types ───────────────────────────────────────────────────
export interface Medication {
  drugName: string
  dosage: string
  frequency: string
}

export type ScheduleTab = "Morning" | "Afternoon" | "Evening"

export interface TimelineProps {
  prescription: Medication[]
  activeTab: ScheduleTab
}

// ─── Scheduling logic ─────────────────────────────────────────
function getSlotsForFrequency(frequency: string): ScheduleTab[] {
  const f = frequency.toLowerCase()
  if (f.includes("three") || f.includes("3") || f.includes("every 8"))    return ["Morning", "Afternoon", "Evening"]
  if (f.includes("twice") || f.includes("two") || f.includes("every 12"))  return ["Morning", "Evening"]
  if (f.includes("afternoon") || f.includes("noon"))                        return ["Afternoon"]
  if (f.includes("night") || f.includes("evening") || f.includes("bed"))   return ["Evening"]
  return ["Morning"]
}

// ─── Config ───────────────────────────────────────────────────
const TAB_CONFIG = {
  Morning: {
    time: "8:00 AM",
    tip: "Take with breakfast",
    color: "#f59e0b",
    colorDim: "rgba(245,158,11,0.08)",
    colorBorder: "rgba(245,158,11,0.18)",
    colorGlow: "rgba(245,158,11,0.4)",
    pillBg: "rgba(245,158,11,0.07)",
    pillBorder: "rgba(245,158,11,0.18)",
    pillText: "#fcd34d",
    icon: SunIcon,
    label: "Morning dose",
    period: "AM",
  },
  Afternoon: {
    time: "1:00 PM",
    tip: "Take with water",
    color: "#3b82f6",
    colorDim: "rgba(59,130,246,0.08)",
    colorBorder: "rgba(59,130,246,0.18)",
    colorGlow: "rgba(59,130,246,0.4)",
    pillBg: "rgba(59,130,246,0.07)",
    pillBorder: "rgba(59,130,246,0.18)",
    pillText: "#93c5fd",
    icon: SunsetIcon,
    label: "Afternoon dose",
    period: "PM",
  },
  Evening: {
    time: "8:00 PM",
    tip: "Take with dinner",
    color: "#8b5cf6",
    colorDim: "rgba(139,92,246,0.08)",
    colorBorder: "rgba(139,92,246,0.18)",
    colorGlow: "rgba(139,92,246,0.4)",
    pillBg: "rgba(139,92,246,0.07)",
    pillBorder: "rgba(139,92,246,0.18)",
    pillText: "#c4b5fd",
    icon: MoonIcon,
    label: "Evening dose",
    period: "PM",
  },
}

// ─── Icons ────────────────────────────────────────────────────
function SunIcon({ color }: { color: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <circle cx="6.5" cy="6.5" r="2.5" stroke={color} strokeWidth="1.3"/>
      <line x1="6.5" y1="1" x2="6.5" y2="2.2" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="6.5" y1="10.8" x2="6.5" y2="12" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="1" y1="6.5" x2="2.2" y2="6.5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="10.8" y1="6.5" x2="12" y2="6.5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="2.8" y1="2.8" x2="3.6" y2="3.6" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="9.4" y1="9.4" x2="10.2" y2="10.2" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="10.2" y1="2.8" x2="9.4" y2="3.6" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="3.6" y1="9.4" x2="2.8" y2="10.2" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

function SunsetIcon({ color }: { color: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M1.5 9.5a5 5 0 0 1 10 0" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="6.5" y1="1" x2="6.5" y2="2.5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="1.8" y1="4.3" x2="2.9" y2="5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="11.2" y1="4.3" x2="10.1" y2="5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="3" y1="11" x2="10" y2="11" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

function MoonIcon({ color }: { color: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M10.5 8.5A5 5 0 0 1 4.5 2.5a5 5 0 1 0 6 6z" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  )
}

function PillIcon({ color }: { color: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <rect x="1.5" y="4.5" width="10" height="4" rx="2" stroke={color} strokeWidth="1.3"/>
      <line x1="6.5" y1="4.5" x2="6.5" y2="8.5" stroke={color} strokeWidth="1.3"/>
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke="rgba(74,84,104,0.6)" strokeWidth="1.3"/>
      <path d="M9 5.5V9l2.5 2" stroke="rgba(74,84,104,0.6)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── CSS ─────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@400;500&family=Geist+Mono:wght@500&display=swap');

  .tl-root { font-family: 'DM Sans', sans-serif; }

  .tl-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 36px 20px; gap: 8px; text-align: center;
  }
  .tl-empty-icon {
    width: 40px; height: 40px; border-radius: 50%;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
    display: flex; align-items: center; justify-content: center; margin-bottom: 4px;
  }
  .tl-empty-title { font-size: 13px; font-weight: 500; color: rgba(100,116,139,0.7); }
  .tl-empty-sub   { font-size: 11px; color: rgba(74,84,104,0.6); }

  .tl-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 14px;
  }
  .tl-header-left { display: flex; align-items: center; gap: 7px; }
  .tl-header-label { font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: rgba(100,116,139,0.6); }
  .tl-count-badge {
    font-size: 10px; font-weight: 700; font-family: 'Geist Mono', monospace;
    border-radius: 100px; padding: 2px 8px;
  }

  .tl-track { position: relative; display: flex; flex-direction: column; }

  .tl-row {
    display: flex; align-items: stretch; gap: 0;
    opacity: 0; transform: translateX(-6px);
    transition: opacity 0.3s ease, transform 0.3s ease;
    position: relative;
  }
  .tl-row.visible { opacity: 1; transform: none; }

  /* Left time column */
  .tl-time-col {
    width: 68px; flex-shrink: 0;
    display: flex; flex-direction: column; align-items: flex-end;
    padding: 12px 12px 12px 0; gap: 3px;
  }
  .tl-time-val {
    font-size: 11px; font-weight: 600; font-family: 'Geist Mono', monospace;
    line-height: 1;
  }
  .tl-period { font-size: 9px; font-weight: 600; letter-spacing: 0.5px; opacity: 0.6; }

  /* Vertical spine */
  .tl-spine-col { width: 24px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; position: relative; }
  .tl-spine-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 14px; flex-shrink: 0; position: relative; z-index: 1; }
  .tl-spine-line { flex: 1; width: 1px; margin-top: 2px; }
  .tl-row:last-child .tl-spine-line { display: none; }

  /* Content */
  .tl-content-col {
    flex: 1; min-width: 0; padding: 10px 0 14px 10px;
  }
  .tl-card {
    display: flex; align-items: center; gap: 10px;
    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
    border-radius: 10px; padding: 10px 12px;
    transition: border-color 0.2s, background 0.2s;
    cursor: default;
  }
  .tl-card:hover { background: rgba(255,255,255,0.04); }

  .tl-pill-icon {
    width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .tl-drug-name {
    font-size: 12.5px; font-weight: 600; color: #e2e8f0;
    letter-spacing: -0.2px; line-height: 1; margin-bottom: 3px;
    font-family: 'Syne', sans-serif;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .tl-drug-meta { font-size: 11px; color: rgba(100,116,139,0.7); line-height: 1; }
  .tl-dose-badge {
    margin-left: auto; flex-shrink: 0;
    font-size: 10px; font-weight: 700; font-family: 'Geist Mono', monospace;
    border-radius: 7px; padding: 3px 9px; letter-spacing: 0.3px;
  }

  .tl-tip-row {
    margin-top: 6px; display: flex; align-items: center; gap: 5px;
    font-size: 10px; color: rgba(100,116,139,0.5);
  }
  .tl-tip-dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(100,116,139,0.3); flex-shrink: 0; }
`

// ─── Component ────────────────────────────────────────────────
export default function Timeline({ prescription, activeTab }: TimelineProps) {
  const cfg = TAB_CONFIG[activeTab]
  const IconComp = cfg.icon

  const scheduled = prescription.filter(med =>
    getSlotsForFrequency(med.frequency).includes(activeTab)
  )

  return (
    <>
      <style>{css}</style>
      <div className="tl-root">

        {/* Empty state */}
        {scheduled.length === 0 ? (
          <div className="tl-empty">
            <div className="tl-empty-icon"><ClockIcon /></div>
            <p className="tl-empty-title">No medications this {activeTab.toLowerCase()}</p>
            <p className="tl-empty-sub">Enjoy your break ✦</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="tl-header">
              <div className="tl-header-left">
                <IconComp color={cfg.color} />
                <span className="tl-header-label">{cfg.label}</span>
              </div>
              <span
                className="tl-count-badge"
                style={{ background: cfg.colorDim, border: `1px solid ${cfg.colorBorder}`, color: cfg.pillText }}
              >
                {scheduled.length} med{scheduled.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Timeline track */}
            <div className="tl-track">
              {scheduled.map((med, i) => (
                <div
                  key={`${med.drugName}-${i}`}
                  className="tl-row"
                  ref={el => {
                    if (el) setTimeout(() => el.classList.add("visible"), i * 80 + 20)
                  }}
                >
                  {/* Time */}
                  <div className="tl-time-col">
                    <span className="tl-time-val" style={{ color: cfg.color }}>
                      {cfg.time.split(" ")[0]}
                    </span>
                    <span className="tl-period" style={{ color: cfg.color }}>{cfg.period}</span>
                  </div>

                  {/* Spine */}
                  <div className="tl-spine-col">
                    <div
                      className="tl-spine-dot"
                      style={{
                        background: cfg.color,
                        boxShadow: `0 0 6px ${cfg.colorGlow}`,
                      }}
                    />
                    <div
                      className="tl-spine-line"
                      style={{ background: `linear-gradient(${cfg.colorBorder}, rgba(255,255,255,0.03))` }}
                    />
                  </div>

                  {/* Content */}
                  <div className="tl-content-col">
                    <div
                      className="tl-card"
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = cfg.colorBorder
                        ;(e.currentTarget as HTMLElement).style.background = cfg.colorDim
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)"
                        ;(e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"
                      }}
                    >
                      <div
                        className="tl-pill-icon"
                        style={{ background: cfg.colorDim, border: `1px solid ${cfg.colorBorder}` }}
                      >
                        <PillIcon color={cfg.color} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="tl-drug-name">{med.drugName}</div>
                        <div className="tl-drug-meta">{med.dosage || "—"}</div>
                      </div>

                      <span
                        className="tl-dose-badge"
                        style={{
                          background: cfg.pillBg,
                          border: `1px solid ${cfg.pillBorder}`,
                          color: cfg.pillText,
                        }}
                      >
                        1 dose
                      </span>
                    </div>

                    <div className="tl-tip-row">
                      <span className="tl-tip-dot" />
                      {cfg.tip}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}