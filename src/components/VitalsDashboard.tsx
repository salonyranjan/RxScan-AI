"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, ReferenceLine,
} from "recharts";

type VitalsLog = {
  id: string;
  recordedAt: string;
  heartRate: number;
  systolicBP: number;
  diastolicBP: number;
};

type DashboardProps = { scanId: string | null | undefined };

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}`;
}

// ── Custom tooltip ────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0c0f15", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 12, padding: "12px 14px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      fontFamily: "'DM Mono', monospace",
    }}>
      <div style={{ fontSize: 10, color: "rgba(148,163,184,0.5)", letterSpacing: "1px", marginBottom: 10 }}>
        {label}
      </div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 5,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.stroke, flexShrink: 0, display: "inline-block" }} />
          <span style={{ fontSize: 11, color: "rgba(148,163,184,0.7)", flex: 1 }}>{p.name}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: p.stroke }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Custom dot ────────────────────────────────────────────────
function CustomDot({ cx, cy, fill }: any) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill={fill} opacity={0.15} />
      <circle cx={cx} cy={cy} r={3} fill={fill} />
    </g>
  );
}

// ── Mini stat pill ─────────────────────────────────────────────
function StatPill({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 3,
      background: `${color}0d`, border: `1px solid ${color}30`,
      borderRadius: 10, padding: "10px 14px", flex: 1, minWidth: 0,
    }}>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "1.2px", textTransform: "uppercase", color: `${color}aa` }}>
        {label}
      </span>
      <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color, letterSpacing: "-1px" }}>
        {value}
      </span>
    </div>
  );
}

// ── Input field ───────────────────────────────────────────────
function VitalInput({
  label, value, onChange, unit, color, icon,
}: {
  label: string; value: number; onChange: (v: number) => void;
  unit: string; color: string; icon: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      background: focused ? `${color}08` : "rgba(255,255,255,0.02)",
      border: `1px solid ${focused ? `${color}40` : "rgba(255,255,255,0.07)"}`,
      borderRadius: 12, padding: "12px 14px",
      transition: "border-color 0.18s, background 0.18s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 7,
          background: `${color}12`, border: `1px solid ${color}25`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: color, flexShrink: 0,
        }}>
          {icon}
        </div>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "1px", textTransform: "uppercase", color: "rgba(148,163,184,0.5)" }}>
          {label}
        </span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(100,116,139,0.4)", marginLeft: "auto" }}>
          {unit}
        </span>
      </div>
      <input
        type="number"
        value={value === 0 ? "" : value}
        onChange={e => onChange(Math.round(Number(e.target.value)) || 0)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="—"
        required
        style={{
          width: "100%", background: "transparent", border: "none", outline: "none",
          fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800,
          color: "#f0f4f8", letterSpacing: "-1.5px",
          caretColor: color,
        }}
      />
    </div>
  );
}

export default function VitalsDashboard({ scanId }: DashboardProps) {
  const [logs, setLogs] = useState<VitalsLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [heartRate, setHeartRate] = useState(0);
  const [systolic, setSystolic] = useState(0);
  const [diastolic, setDiastolic] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!scanId) return;
    setLoading(true);
    setLoadError(null);
    fetch(`/api/vitals?scanId=${scanId}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data: any[]) => {
        setLogs(data.map(item => item.values ? {
          id: `${item.date}-${Math.random()}`, recordedAt: item.date,
          heartRate:   Number(item.values["Pulse (BPM)"]),
          systolicBP:  Number(item.values["Systolic (mmHg)"]),
          diastolicBP: Number(item.values["Diastolic (mmHg)"]),
        } : {
          id: item.id, recordedAt: item.recordedAt,
          heartRate:   Number(item.heartRate),
          systolicBP:  Number(item.systolicBP),
          diastolicBP: Number(item.diastolicBP),
        }));
      })
      .catch(e => setLoadError(e.message))
      .finally(() => setLoading(false));
  }, [scanId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSaveError(null); setSaved(false);
    try {
      const res = await fetch("/api/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId, heartRate, systolicBP: systolic, diastolicBP: diastolic }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error ?? `HTTP ${res.status}`); }
      const fresh = await res.json();
      const safeHeartRate   = Math.round(Number(heartRate));
      const safeSystolic    = Math.round(Number(systolic));
      const safeDiastolic   = Math.round(Number(diastolic));
      setLogs(prev => [...prev, {
        id: fresh.vitalsId ?? `${Date.now()}`,
        recordedAt: new Date().toISOString(),
        heartRate:   safeHeartRate,
        systolicBP:  safeSystolic,
        diastolicBP: safeDiastolic,
      }]);
      setHeartRate(0); setSystolic(0); setDiastolic(0);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) { setSaveError(e.message); }
    finally { setSaving(false); }
  }

  // ── scanId gate ───────────────────────────────────────────────
  if (!scanId) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap');
          @keyframes vd-await-pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
          @keyframes vd-await-scan  { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }
        `}</style>
        <div style={{
          background: "#0c0f15",
          border: "1px dashed rgba(61,133,247,0.25)",
          borderRadius: 20,
          padding: "40px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          marginBottom: 24,
        }}>
          {/* Animated scan line */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(61,133,247,0.6), transparent)",
            animation: "vd-await-scan 2.8s ease-in-out infinite",
          }} />

          {/* Icon */}
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "rgba(61,133,247,0.07)", border: "1px solid rgba(61,133,247,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#3d85f7", animation: "vd-await-pulse 2.5s ease-in-out infinite",
          }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 2C6.03 2 2 6.03 2 11s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M11 6v5l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Title */}
          <div style={{
            fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700,
            color: "#f0f4f8", letterSpacing: "-0.3px",
          }}>
            Vitals Monitor
          </div>

          {/* Status line */}
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11,
            color: "rgba(61,133,247,0.7)", letterSpacing: "0.5px",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%", background: "#3d85f7",
              display: "inline-block", animation: "vd-await-pulse 1.8s ease-in-out infinite",
            }} />
            Awaiting scan ID token…
          </div>

          {/* Helper text */}
          <p style={{
            fontFamily: "'DM Mono', monospace", fontSize: 10,
            color: "rgba(100,116,139,0.45)", margin: 0, maxWidth: 320,
            lineHeight: 1.7, letterSpacing: "0.3px",
          }}>
            Upload and analyze a prescription above to activate the vitals tracking dashboard for this session.
          </p>
        </div>
      </>
    );
  }

  const chartData = logs.map(l => ({
    date: fmtDate(l.recordedAt), pulse: l.heartRate,
    systolic: l.systolicBP, diastolic: l.diastolicBP,
  }));

  const latest = logs[logs.length - 1];
  const avgPulse = logs.length ? Math.round(logs.reduce((s, l) => s + l.heartRate, 0) / logs.length) : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500&display=swap');
        @keyframes vd-in   { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
        @keyframes vd-pulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes vd-spin  { to { transform:rotate(360deg); } }
        @keyframes vd-saved { 0%{opacity:0;transform:scale(0.9)} 15%{opacity:1;transform:none} 85%{opacity:1} 100%{opacity:0} }
        /* recharts overrides */
        .recharts-cartesian-axis-tick text { font-family:'DM Mono',monospace !important; font-size:10px !important; }
        .recharts-legend-item-text { font-family:'DM Mono',monospace !important; font-size:10px !important; }
      `}</style>

      <div style={{
        background: "#0c0f15", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20, overflow: "hidden", fontFamily: "'DM Sans', sans-serif",
        animation: "vd-in 0.4s ease both",
      }}>
        {/* ── Top header bar ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.01)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: "rgba(255,77,77,0.08)", border: "1px solid rgba(255,77,77,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#ff4d4d",
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 12C7 12 2 8.5 2 5a3 3 0 0 1 5-2.2A3 3 0 0 1 12 5c0 3.5-5 7-5 7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: "#f0f4f8", letterSpacing: "-0.3px" }}>
                Vitals Monitor
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(100,116,139,0.6)", letterSpacing: "0.5px" }}>
                scan:{scanId.slice(0, 8)}…
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%", background: "#00c896",
              display: "inline-block", boxShadow: "0 0 8px rgba(0,200,150,0.7)",
              animation: "vd-pulse 2.5s ease-in-out infinite",
            }} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "1.2px", textTransform: "uppercase", color: "rgba(100,116,139,0.6)" }}>
              Monitoring
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>

          {/* ── LEFT: LOG FORM ── */}
          <div style={{ padding: 24, borderRight: "1px solid rgba(255,255,255,0.05)" }}>

            {/* Latest reading summary */}
            {latest && (
              <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
                <StatPill label="Pulse" value={latest.heartRate} color="#ff4d4d" />
                <StatPill label="Systolic" value={latest.systolicBP} color="#3d85f7" />
                <StatPill label="Diastolic" value={latest.diastolicBP} color="#a78bfa" />
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "1.6px", textTransform: "uppercase", color: "rgba(100,116,139,0.55)" }}>
                Log Entry
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(100,116,139,0.4)" }}>
                {logs.length} recorded
              </span>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <VitalInput
                label="Heart Rate" unit="BPM" value={heartRate} onChange={setHeartRate} color="#ff4d4d"
                icon={<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 9.5S1 6.5 1 3.5a2.5 2.5 0 0 1 4.5-1.5A2.5 2.5 0 0 1 10 3.5c0 3-4.5 6-4.5 6z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>}
              />
              <VitalInput
                label="Systolic BP" unit="mmHg" value={systolic} onChange={setSystolic} color="#3d85f7"
                icon={<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1.5v8M2 5.5h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>}
              />
              <VitalInput
                label="Diastolic BP" unit="mmHg" value={diastolic} onChange={setDiastolic} color="#a78bfa"
                icon={<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>}
              />

              <button
                type="submit"
                disabled={saving}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  marginTop: 6, padding: "12px 20px", borderRadius: 12, border: "none",
                  background: saving ? "rgba(61,133,247,0.3)" : "#3d85f7",
                  color: "#fff", fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer", letterSpacing: "0.2px",
                  boxShadow: saving ? "none" : "0 0 0 1px rgba(61,133,247,0.5), 0 4px 20px rgba(61,133,247,0.25)",
                  transition: "all 0.2s",
                }}
              >
                {saving ? (
                  <>
                    <svg style={{ animation: "vd-spin 0.8s linear infinite" }} width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <circle cx="6.5" cy="6.5" r="5" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
                      <path d="M6.5 1.5a5 5 0 0 1 5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 7L5 10L11 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Record Vitals
                  </>
                )}
              </button>

              {saved && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 7, padding: "10px 13px",
                  borderRadius: 10, background: "rgba(0,200,150,0.07)", border: "1px solid rgba(0,200,150,0.2)",
                  animation: "vd-saved 3s ease both",
                }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#00c896" strokeWidth="1.2"/><path d="M3.5 6L5.5 8L8.5 4" stroke="#00c896" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#00c896" }}>Vitals recorded successfully</span>
                </div>
              )}
              {saveError && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 7, padding: "10px 13px",
                  borderRadius: 10, background: "rgba(255,77,77,0.07)", border: "1px solid rgba(255,77,77,0.2)",
                }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1L11 10H1L6 1Z" stroke="#ff4d4d" strokeWidth="1.2" strokeLinejoin="round"/><path d="M6 4.5V7M6 8.5V9" stroke="#ff4d4d" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#ff4d4d" }}>{saveError}</span>
                </div>
              )}
            </form>

            {/* Avg stat */}
            {avgPulse > 0 && (
              <div style={{
                marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(100,116,139,0.45)", letterSpacing: "0.5px" }}>
                  Avg pulse (all readings)
                </span>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 800, color: "#ff4d4d", letterSpacing: "-0.5px" }}>
                  {avgPulse} <span style={{ fontSize: 10, fontWeight: 400, fontFamily: "'DM Mono', monospace", color: "rgba(255,77,77,0.6)" }}>BPM</span>
                </span>
              </div>
            )}
          </div>

          {/* ── RIGHT: CHART ── */}
          <div style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "1.6px", textTransform: "uppercase", color: "rgba(100,116,139,0.55)" }}>
                Vitals Trend
              </span>
              {/* Legend */}
              <div style={{ display: "flex", gap: 14 }}>
                {[["#ff4d4d","Pulse"],["#3d85f7","Sys"],["#a78bfa","Dia"]].map(([color, name]) => (
                  <div key={name} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(148,163,184,0.5)" }}>{name}</span>
                  </div>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 280, gap: 10 }}>
                <svg style={{ animation: "vd-spin 1s linear infinite" }} width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="rgba(61,133,247,0.2)" strokeWidth="2"/>
                  <path d="M8 2a6 6 0 0 1 6 6" stroke="#3d85f7" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "rgba(100,116,139,0.5)" }}>Loading chart…</span>
              </div>
            ) : loadError ? (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                height: 280, gap: 8,
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: "#ff4d4d", opacity: 0.5 }}>
                  <path d="M12 2L22 20H2L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M12 9v5M12 16.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "rgba(255,77,77,0.7)" }}>{loadError}</span>
              </div>
            ) : chartData.length === 0 ? (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                height: 280, gap: 12,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "rgba(74,84,104,0.4)",
                }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 18L8 12l4 3 4-6 4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(100,116,139,0.55)", margin: 0 }}>
                  No readings yet. Log your first vitals.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(100,116,139,0.3)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "rgba(100,116,139,0.5)", fontFamily: "'DM Mono', monospace" }}
                  />
                  <YAxis
                    stroke="rgba(100,116,139,0.3)"
                    fontSize={10}
                    width={42}
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "rgba(100,116,139,0.5)", fontFamily: "'DM Mono', monospace" }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }} />
                  {/* Normal range bands */}
                  <ReferenceLine y={120} stroke="rgba(61,133,247,0.12)" strokeDasharray="4 4" />
                  <ReferenceLine y={80} stroke="rgba(167,139,250,0.12)" strokeDasharray="4 4" />
                  <Line
                    type="monotone" dataKey="pulse" name="Pulse (BPM)"
                    stroke="#ff4d4d" strokeWidth={2}
                    dot={<CustomDot fill="#ff4d4d" />}
                    activeDot={{ r: 5, fill: "#ff4d4d", stroke: "#ff4d4d30", strokeWidth: 6 }}
                  />
                  <Line
                    type="monotone" dataKey="systolic" name="Systolic (mmHg)"
                    stroke="#3d85f7" strokeWidth={2}
                    dot={<CustomDot fill="#3d85f7" />}
                    activeDot={{ r: 5, fill: "#3d85f7", stroke: "#3d85f730", strokeWidth: 6 }}
                  />
                  <Line
                    type="monotone" dataKey="diastolic" name="Diastolic (mmHg)"
                    stroke="#a78bfa" strokeWidth={2}
                    dot={<CustomDot fill="#a78bfa" />}
                    activeDot={{ r: 5, fill: "#a78bfa", stroke: "#a78bfa30", strokeWidth: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}

            {/* Chart footer */}
            {chartData.length > 0 && (
              <div style={{
                marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)",
                display: "flex", justifyContent: "space-between",
                fontFamily: "'DM Mono', monospace", fontSize: 10,
                color: "rgba(100,116,139,0.4)", letterSpacing: "0.3px",
              }}>
                <span>{chartData.length} reading{chartData.length !== 1 ? "s" : ""}</span>
                <span>Dashed = normal range</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}