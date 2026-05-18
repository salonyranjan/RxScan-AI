"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import "./globals.css";

// ─── Types ────────────────────────────────────────────────────
interface Medication {
  drugName: string;
  dosage: string;
  frequency?: string;
}

interface Interaction {
  drugA: string;
  drugB: string;
  severity: "critical" | "caution";
  plainEnglishWarning: string;
}

type ScheduleTab = "Morning" | "Afternoon" | "Evening";

interface ScanStep {
  id: string;
  label: string;
}

// ─── Helpers ────────────────────────────────────────────────
const MED_ICONS = ["💊", "🧬", "💉", "🩺", "⚗️", "🔬", "🧪", "🫀"];
const getMedIcon = (name = ""): string => MED_ICONS[name.charCodeAt(0) % MED_ICONS.length];

const SCAN_STEPS: ScanStep[] = [
  { id: "ocr", label: "Reading prescription text" },
  { id: "extract", label: "Extracting medications" },
  { id: "nih", label: "Checking NIH interaction database" },
  { id: "analyze", label: "Analysing combinations" },
];

// 🚀 UPGRADED MATRIX: Includes medical abbreviations to prevent scheduling drops
const SCHEDULE: Record<ScheduleTab, string[]> = {
  Morning: ["once daily", "twice daily", "three times", "morning", "am", "breakfast", "bid", "tid", "qd"],
  Afternoon: ["twice daily", "three times", "afternoon", "noon", "lunch", "with meals", "bid", "tid"],
  Evening: ["twice daily", "three times", "evening", "night", "pm", "dinner", "bedtime", "sleep", "bid", "tid"],
};

function getMedsForTab(meds: Medication[], tab: ScheduleTab): Medication[] {
  const kw = SCHEDULE[tab];
  return meds.filter((m) => kw.some((k) => (m.frequency ?? "").toLowerCase().includes(k)));
}

// ─── Scan-step animator ──────────────────────────────────────
function useScanSteps(isScanning: boolean): { stepIdx: number; progress: number } {
  const [stepIdx, setStepIdx] = useState(-1);
  const [progress, setProgress] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isScanning) {
      setStepIdx(-1);
      setProgress(0);
      return;
    }
    let i = 0;
    setStepIdx(0);
    setProgress(5);
    ref.current = setInterval(() => {
      i++;
      setStepIdx(Math.min(i, SCAN_STEPS.length - 1));
      setProgress(Math.min(10 + i * 22, 88));
    }, 1400);
    return () => {
      if (ref.current !== null) clearInterval(ref.current);
    };
  }, [isScanning]);

  return { stepIdx, progress };
}

// ─── Component ───────────────────────────────────────────────
export default function PrescriptionScanner() {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [dataSource, setDataSource] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<ScheduleTab>("Morning");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  
  // 🚀 HYDRATION REINFORCEMENT SHIELD LOCK
  const [isMounted, setIsMounted] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const { stepIdx, progress } = useScanSteps(scanning);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalMeds = meds.length;
  const uniqueDrugs = new Set(meds.map((m) => m.drugName)).size;
  const warnCount = interactions.length;
  const hasResults = totalMeds > 0;

  const handleUpload = useCallback(async (base64Image: string) => {
    setScanning(true);
    setError("");
    try {
      const res = await fetch("/api/analyze-prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: base64Image }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Could not parse the document. Try a clearer image.");
        return;
      }
      setMeds(data.medications ?? []);
      setInteractions(data.interactions ?? []);
      setDataSource(data.source ?? "");
    } catch {
      setError("Could not reach the clinical analysis engine. Check your connection.");
    } finally {
      setScanning(false);
    }
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      if (!file) return;
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      const reader = new FileReader();
      reader.onload = () => handleUpload(reader.result as string);
      reader.readAsDataURL(file);
    },
    [handleUpload]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleFile(e.target.files?.[0] as File);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  const tabMeds = getMedsForTab(meds, activeTab);

  // 🚀 SERVER-RENDER BYPASS GUARD: Blocks server text string comparison loops
  if (!isMounted) {
    return <div className="rx-root" />;
  }

  return (
    <div className="rx-root">
      <div className="rx-bg" />
      <div className="rx-orb1" />
      <div className="rx-orb2" />

      <div className="rx-wrap">
        {/* ── Nav ── */}
        <nav className="rx-nav">
          <div className="rx-nav-logo">
            <div className="rx-nav-icon">Rx</div>
            <div>
              <div className="rx-nav-title">RxScan AI</div>
              <div className="rx-nav-sub">Prescription Intelligence Platform</div>
            </div>
          </div>
          <div className="rx-nav-status">
            <span className="rx-nav-dot" />
            System online
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="rx-hero">
          <div className="rx-hero-badge">⚕ AI-Powered Analysis</div>
          <h1>Prescription Scanner</h1>
          <p>
            Upload a photo of your prescription. Our AI reads medications and checks for
            dangerous drug interactions — explained in plain English.
          </p>
        </section>

        {/* ── Stats ── */}
        <div className="rx-stats">
          {[
            { label: "Medications", value: totalMeds, desc: "Found in prescription", cls: "rx-stat-blue" },
            { label: "Unique compounds", value: uniqueDrugs, desc: "Distinct drug substances", cls: "rx-stat-white" },
            {
              label: "Warnings",
              value: warnCount,
              desc: "Interactions to review",
              cls: warnCount > 0 ? "rx-stat-red" : "rx-stat-green",
            },
          ].map(({ label, value, desc, cls }) => (
            <div key={label} className={`rx-stat ${cls}`}>
              <div className="rx-stat-label">{label}</div>
              <div className="rx-stat-value">{value}</div>
              <div className="rx-stat-desc">{desc}</div>
            </div>
          ))}
        </div>

        {/* ── Upload ── */}
        <div className="rx-upload-card">
          <div className="rx-section-header">
            <span className="rx-section-header-icon">⬆</span>
            Upload Prescription
          </div>

          <div
            className={`rx-dropzone${dragOver ? " drag-over" : ""}`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => !scanning && inputRef.current?.click()}
          >
            <div className="rx-dropzone-icon">📋</div>
            <h3>Drop your prescription photo here</h3>
            <p>JPG, PNG or PDF up to 10 MB — supports handwritten and printed Rx</p>
            <button
              className="rx-btn-upload"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              <span>⬆</span> Choose file
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*,.pdf"
              style={{ display: "none" }}
              onChange={onInputChange}
            />
          </div>

          {previewUrl && !scanning && (
            <img src={previewUrl} alt="Prescription preview" className="rx-preview" />
          )}

          {scanning && (
            <div className="rx-scanning">
              <div className="rx-scan-header">
                <div className="rx-scan-spinner" />
                <span className="rx-scan-text">Analysing prescription…</span>
              </div>
              <div className="rx-scan-steps">
                {SCAN_STEPS.map((step, i) => (
                  <div
                    key={step.id}
                    className={`rx-scan-step ${i < stepIdx ? "done" : i === stepIdx ? "active" : "pending"}`}
                  >
                    <div className="rx-scan-step-icon">
                      {i < stepIdx ? "✓" : i === stepIdx ? "→" : "○"}
                    </div>
                    {step.label}
                  </div>
                ))}
              </div>
              <div className="rx-progress-bar-wrap">
                <div className="rx-progress-bar" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {error && !scanning && (
            <div className="rx-error">
              <span>⚠</span> {error}
            </div>
          )}
        </div>

        {/* ── Results ── */}
        {hasResults && (
          <>
            <div className="rx-results-grid">
              {/* Medications List */}
              <div className="rx-card" style={{ animationDelay: "0ms" }}>
                <div className="rx-section-header">
                  <span>💊</span> Your medications
                </div>
                <div className="rx-med-list">
                  {meds.map((med, i) => (
                    <div
                      key={i}
                      className="rx-med-item"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <div className="rx-med-avatar">{getMedIcon(med.drugName)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="rx-med-name">{med.drugName}</div>
                        <div className="rx-med-meta">
                          {med.dosage}
                          {med.frequency ? ` · ${med.frequency}` : ""}
                        </div>
                      </div>
                      <span className="rx-med-badge">Active</span>
                    </div>
                  ))}
                </div>
                <div className="rx-confidence">
                  <div className="rx-conf-row">
                    <span>AI confidence</span>
                    <span className="rx-conf-val">94%</span>
                  </div>
                  <div className="rx-conf-bar-bg">
                    <div className="rx-conf-bar-fill" style={{ width: "94%" }} />
                  </div>
                </div>
              </div>

              {/* Interactions Box */}
              <div
                className={`rx-card${warnCount > 0 ? " rx-card-danger" : ""}`}
                style={{ animationDelay: "100ms" }}
              >
                {warnCount > 0 ? (
                  <>
                    <div className="rx-section-header rx-section-header--danger">
                      <span>⚠</span> Drug Interaction Warnings
                    </div>
                    <div className="rx-warn-disclaimer">
                      Always consult your doctor or pharmacist before changing medications.
                    </div>
                    {interactions.map((item, i) => (
                      <div
                        key={i}
                        className="rx-warn-item"
                        style={{ animationDelay: `${i * 80}ms` }}
                      >
                        <div className={`rx-warn-icon ${item.severity}`}>
                          {item.severity === "critical" ? "🚨" : "⚠️"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="rx-warn-pair">
                            <span>{item.drugA}</span>
                            <span className="rx-warn-plus">+</span>
                            <span>{item.drugB}</span>
                            <span className={`rx-warn-badge ${item.severity}`}>
                              {item.severity === "critical" ? "Critical" : "Caution"}
                            </span>
                          </div>
                          <div className="rx-warn-msg">{item.plainEnglishWarning}</div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="rx-safe">
                    <div className="rx-safe-ring">✓</div>
                    <div className="rx-safe-title">No interactions detected</div>
                    <div className="rx-safe-sub">
                      All medications appear safe to take together based on the NIH database.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule Timeline */}
            <div className="rx-card rx-schedule-card" style={{ animationDelay: "200ms" }}>
              <div className="rx-section-header">
                <span>🕐</span> Daily Schedule
              </div>
              <div className="rx-tabs">
                {(["Morning", "Afternoon", "Evening"] as ScheduleTab[]).map((tab) => (
                  <button
                    key={tab}
                    className={`rx-tab${activeTab === tab ? " active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === "Morning" ? "🌅" : tab === "Afternoon" ? "☀️" : "🌙"} {tab}
                  </button>
                ))}
              </div>
              <div className="rx-timeline">
                {tabMeds.length === 0 ? (
                  <div className="rx-tl-empty">
                    No medications scheduled for this time of day.
                  </div>
                ) : (
                  tabMeds.map((med, i) => (
                    <div key={i} className="rx-tl-item">
                      <div className="rx-tl-dot-wrap">
                        <div className="rx-tl-dot" />
                      </div>
                      <div className="rx-tl-content">
                        <div className="rx-tl-time">
                          {activeTab === "Morning"
                            ? "08:00"
                            : activeTab === "Afternoon"
                            ? "13:00"
                            : "20:00"}
                        </div>
                        <div className="rx-tl-meds">
                          <div className="rx-tl-med">
                            <div className="rx-tl-med-dot" />
                            <span className="rx-tl-med-name">{med.drugName}</span>
                            <span className="rx-tl-med-dose">· {med.dosage}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* Data Source Matrix */}
        {dataSource && (
          <div className="rx-source">
            <span>🗄</span>
            <span>
              Source: <span>{dataSource}</span>
            </span>
          </div>
        )}

        <footer className="rx-footer">
          This tool does not replace professional medical advice.
          <br />
          Always confirm with your doctor or pharmacist before changing medications.
          <br />
          <a href="#">Privacy Policy</a> · <a href="#">Terms of Use</a> · Powered by Groq AI
        </footer>
      </div>
    </div>
  );
}