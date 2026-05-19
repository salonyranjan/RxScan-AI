"use client";

interface Activity {
  type: "upload" | "alert" | "auth" | "scan" | "check";
  description: string;
  timestamp: string;
  meta?: string;
}

const TYPE_CONFIG: Record<Activity["type"], { color: string; bg: string; icon: string }> = {
  upload: { color: "#3d85f7", bg: "rgba(61,133,247,0.1)",  icon: "↑" },
  alert:  { color: "#f05252", bg: "rgba(240,82,82,0.1)",   icon: "!" },
  auth:   { color: "#445566", bg: "rgba(68,85,102,0.15)",  icon: "→" },
  scan:   { color: "#00c896", bg: "rgba(0,200,150,0.1)",   icon: "◎" },
  check:  { color: "#a78bfa", bg: "rgba(167,139,250,0.1)", icon: "✓" },
};

const ACTIVITIES: Activity[] = [
  { type: "upload", description: "Uploaded prescription image", timestamp: "2m ago", meta: "rx_scan_001.jpg" },
  { type: "alert",  description: "Interaction alert triggered", timestamp: "5m ago", meta: "2 warnings" },
  { type: "scan",   description: "Analysis completed", timestamp: "5m ago", meta: "94% confidence" },
  { type: "check",  description: "NIH database queried", timestamp: "5m ago", meta: "12 drug pairs" },
  { type: "auth",   description: "Session started", timestamp: "12m ago", meta: "Dr. Account" },
];

export default function UserActivity() {
  return (
    <div style={{
      background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 18, padding: 22, fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 18, paddingBottom: 16,
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, color: "#a78bfa",
          }}>
            ≡
          </div>
          <span style={{
            fontFamily: "'Syne', sans-serif", fontSize: 13,
            fontWeight: 600, color: "#f0f4f8", letterSpacing: "-0.2px",
          }}>
            Activity Log
          </span>
        </div>
        <span style={{
          fontFamily: "'DM Mono', monospace", fontSize: 10,
          color: "#445566", letterSpacing: "1px",
        }}>
          RECENT
        </span>
      </div>

      {/* Activity items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {ACTIVITIES.map((act, i) => {
          const cfg = TYPE_CONFIG[act.type];
          return (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 8px", borderRadius: 10,
                transition: "background 0.15s", cursor: "default",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#111822")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Type indicator */}
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: cfg.bg, border: `1px solid ${cfg.color}22`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, color: cfg.color, fontFamily: "'DM Mono', monospace",
              }}>
                {cfg.icon}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12, fontWeight: 500, color: "#8899aa",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {act.description}
                </div>
                {act.meta && (
                  <div style={{
                    fontFamily: "'DM Mono', monospace", fontSize: 10,
                    color: cfg.color, opacity: 0.7, marginTop: 2, letterSpacing: "0.3px",
                  }}>
                    {act.meta}
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div style={{
                fontFamily: "'DM Mono', monospace", fontSize: 10,
                color: "#445566", flexShrink: 0, letterSpacing: "0.3px",
              }}>
                {act.timestamp}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{
          fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#445566", letterSpacing: "0.5px",
        }}>
          {ACTIVITIES.length} events logged
        </span>
        <button style={{
          fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 600,
          color: "#3d85f7", background: "none", border: "none",
          cursor: "pointer", letterSpacing: "0.2px", padding: 0,
        }}>
          View all →
        </button>
      </div>
    </div>
  );
}