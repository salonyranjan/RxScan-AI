"use client"

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

function getSlots(freq: string): ScheduleTab[] {
  const f = freq.toLowerCase()
  if (f.includes("three") || f.includes("3") || f.includes("every 8"))   return ["Morning","Afternoon","Evening"]
  if (f.includes("twice") || f.includes("two") || f.includes("every 12")) return ["Morning","Evening"]
  if (f.includes("afternoon") || f.includes("noon"))                       return ["Afternoon"]
  if (f.includes("night") || f.includes("evening") || f.includes("bed"))  return ["Evening"]
  return ["Morning"]
}

const TAB = {
  Morning: {
    time: "08:00", period: "AM",
    accent: "#f0a832", accentAlpha: "rgba(240,168,50,0.07)", accentBorder: "rgba(240,168,50,0.18)",
    accentGlow: "rgba(240,168,50,0.5)", pillText: "#f5c96a",
    tip: "Take with breakfast",
    icon: (c: string) => (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="2.8" stroke={c} strokeWidth="1.3"/>
        <path d="M7 1.5V2.8M7 11.2V12.5M1.5 7H2.8M11.2 7H12.5M3.4 3.4L4.3 5.3M9.7 9.7L10.6 8.8M10.6 3.4L9.7 4.3M4.3 8.8L3.4 9.7" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  Afternoon: {
    time: "13:00", period: "PM",
    accent: "#3d85f7", accentAlpha: "rgba(61,133,247,0.07)", accentBorder: "rgba(61,133,247,0.18)",
    accentGlow: "rgba(61,133,247,0.5)", pillText: "#7aaaf7",
    tip: "Take with water",
    icon: (c: string) => (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M1.5 10a5.5 5.5 0 0 1 11 0" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M7 1.5V3M3 4L4 4.9M11 4L10 4.9M1.5 8H3M11 8H12.5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="3" y1="11.5" x2="11" y2="11.5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  Evening: {
    time: "20:00", period: "PM",
    accent: "#a78bfa", accentAlpha: "rgba(167,139,250,0.07)", accentBorder: "rgba(167,139,250,0.18)",
    accentGlow: "rgba(167,139,250,0.5)", pillText: "#c4b5fd",
    tip: "Take with dinner",
    icon: (c: string) => (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M11 8.5A5 5 0 0 1 5 2.5a5 5 0 1 0 6 6Z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/>
        <path d="M9.5 1.5L10.2 2.5M11 3.5L12 3.2M11.5 5L12.5 5.5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
}

export default function Timeline({ prescription, activeTab }: TimelineProps) {
  const cfg = TAB[activeTab]
  const scheduled = prescription.filter(m => getSlots(m.frequency).includes(activeTab))

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500&display=swap');
        @keyframes tl-in { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:none; } }
        .tl-card-inner {
          display:flex; align-items:center; gap:11px;
          background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05);
          border-radius:10px; padding:10px 13px; cursor:default;
          transition:border-color 0.18s, background 0.18s;
        }
        .tl-card-inner:hover {
          border-color:var(--tl-accent-border);
          background:var(--tl-accent-alpha);
        }
      `}</style>

      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {scheduled.length === 0 ? (
          /* Empty state */
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "40px 20px", gap: 10, textAlign: "center",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(74,84,104,0.5)",
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M9 5.5V9l2.5 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(100,116,139,0.65)", fontWeight: 400 }}>
              No medications scheduled for {activeTab.toLowerCase()}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: "rgba(74,84,104,0.45)" }}>Rest well ✦</p>
          </div>
        ) : (
          <>
            {/* Time period header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {cfg.icon(cfg.accent)}
                <span style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 500,
                  letterSpacing: "1.4px", textTransform: "uppercase", color: cfg.accent, opacity: 0.8,
                }}>
                  {activeTab} dose
                </span>
              </div>
              <span style={{
                fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 500,
                background: cfg.accentAlpha, border: `1px solid ${cfg.accentBorder}`,
                color: cfg.pillText, borderRadius: 100, padding: "2px 9px",
              }}>
                {scheduled.length} med{scheduled.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Timeline rows */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {scheduled.map((med, i) => (
                <div
                  key={`${med.drugName}-${i}`}
                  style={{
                    display: "flex", alignItems: "stretch", gap: 0,
                    animation: `tl-in 0.3s ${i * 75}ms both`,
                  }}
                >
                  {/* Time column */}
                  <div style={{
                    width: 66, flexShrink: 0, display: "flex", flexDirection: "column",
                    alignItems: "flex-end", padding: "12px 12px 12px 0",
                  }}>
                    <span style={{
                      fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 500,
                      color: cfg.accent, lineHeight: 1, letterSpacing: "-0.5px",
                    }}>
                      {cfg.time}
                    </span>
                    <span style={{
                      fontFamily: "'DM Mono', monospace", fontSize: 9, fontWeight: 500,
                      color: cfg.accent, opacity: 0.55, letterSpacing: "0.8px", marginTop: 2,
                    }}>
                      {cfg.period}
                    </span>
                  </div>

                  {/* Spine */}
                  <div style={{
                    width: 22, flexShrink: 0, display: "flex",
                    flexDirection: "column", alignItems: "center",
                  }}>
                    <div style={{
                      width: 9, height: 9, borderRadius: "50%", marginTop: 13,
                      background: cfg.accent, boxShadow: `0 0 8px ${cfg.accentGlow}`,
                      flexShrink: 0, zIndex: 1,
                    }} />
                    {i < scheduled.length - 1 && (
                      <div style={{
                        flex: 1, width: 1, marginTop: 3,
                        background: `linear-gradient(${cfg.accentBorder}, rgba(255,255,255,0.02))`,
                        minHeight: 16,
                      }} />
                    )}
                  </div>

                  {/* Card */}
                  <div style={{ flex: 1, minWidth: 0, padding: "9px 0 14px 10px" }}>
                    <div
                      className="tl-card-inner"
                      style={{
                        // CSS variables for hover state
                        "--tl-accent-border": cfg.accentBorder,
                        "--tl-accent-alpha": cfg.accentAlpha,
                      } as React.CSSProperties}
                    >
                      {/* Drug letter */}
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: cfg.accentAlpha, border: `1px solid ${cfg.accentBorder}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 800, color: cfg.accent,
                      }}>
                        {med.drugName.charAt(0).toUpperCase()}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700,
                          color: "#edf2f7", letterSpacing: "-0.2px",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                          {med.drugName}
                        </div>
                        <div style={{
                          fontFamily: "'DM Mono', monospace", fontSize: 10,
                          color: "rgba(100,116,139,0.65)", marginTop: 2, letterSpacing: "0.2px",
                        }}>
                          {med.dosage || "—"}
                        </div>
                      </div>

                      <span style={{
                        fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 500,
                        letterSpacing: "0.3px", flexShrink: 0,
                        background: cfg.accentAlpha, border: `1px solid ${cfg.accentBorder}`,
                        color: cfg.pillText, borderRadius: 7, padding: "3px 9px",
                      }}>
                        1 dose
                      </span>
                    </div>

                    {/* Tip line */}
                    <div style={{
                      marginTop: 5, display: "flex", alignItems: "center", gap: 5,
                      fontFamily: "'DM Mono', monospace", fontSize: 10,
                      color: "rgba(100,116,139,0.45)", letterSpacing: "0.2px",
                    }}>
                      <span style={{
                        width: 3, height: 3, borderRadius: "50%",
                        background: "rgba(100,116,139,0.3)", flexShrink: 0,
                        display: "inline-block",
                      }} />
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