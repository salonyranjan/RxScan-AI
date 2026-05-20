"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { jsPDF } from "jspdf";
import VitalsDashboard from "@/components/VitalsDashboard";

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface ScanResult {
  id?: string;
  scannedAt: string;
  patientName: string;
  recordDate?: string; // 🚀 FIXED: Correct Prisma key
  medications?: Medication[];
  interactions?: Interaction[];
  drugInteractions?: Interaction[];
  lifestyleWarnings?: string[];
}

type ActiveMenu = "Scanner" | "History" | "Database";
type ScheduleTab = "Morning" | "Afternoon" | "Evening";

interface ScanStep {
  id: string;
  label: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SCAN_STEPS: ScanStep[] = [
  { id: "ocr",     label: "Reading prescription text" },
  { id: "extract", label: "Extracting medications"    },
  { id: "nih",     label: "Querying NIH database"     },
  { id: "analyze", label: "Analyzing combinations"    },
];

const SCHEDULE_KEYWORDS: Record<ScheduleTab, string[]> = {
  Morning:   ["once daily","qd","morning","am","breakfast","od","every morning","daily"],
  Afternoon: ["afternoon","noon","lunch","midday","with meals","with food"],
  Evening:   ["evening","night","pm","dinner","bedtime","sleep","nocte","hs","nightly"],
};

const TWICE_DAILY_KEYWORDS  = ["twice daily","bid","b.i.d","two times","2 times"];
const THRICE_DAILY_KEYWORDS = ["three times","thrice","tid","t.i.d","3 times"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMedsForTab(meds: Medication[], tab: ScheduleTab): Medication[] {
  return meds.filter((m) => {
    const f = (m.frequency ?? "").toLowerCase();
    if (!f) return false;
    if (THRICE_DAILY_KEYWORDS.some(k => f.includes(k))) return true;
    if (TWICE_DAILY_KEYWORDS.some(k => f.includes(k)))
      return tab === "Morning" || tab === "Evening";
    return SCHEDULE_KEYWORDS[tab].some(k => f.includes(k));
  });
}

function capitaliseName(name: string): string {
  return name.toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// ─── useScanSteps hook ────────────────────────────────────────────────────────

function useScanSteps(isScanning: boolean) {
  const [stepIdx, setStepIdx]   = useState(-1);
  const [progress, setProgress] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isScanning) { setStepIdx(-1); setProgress(0); return; }
    let i = 0;
    setStepIdx(0); setProgress(8);
    ref.current = setInterval(() => {
      i++;
      setStepIdx(Math.min(i, SCAN_STEPS.length - 1));
      setProgress(Math.min(12 + i * 20, 85));
    }, 1500);
    return () => { if (ref.current !== null) clearInterval(ref.current); };
  }, [isScanning]);

  return { stepIdx, progress };
}

// ─── PDF export ───────────────────────────────────────────────────────────────

function exportPDF(item: {
  patientName: string;
  recordDate?: string; // 🚀 FIXED: Correct key name
  scannedAt: string;
  medications: Medication[];
  interactions: Interaction[];
  lifestyleWarnings?: string[];
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 60, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined as any, "bold");
  doc.text("RxScan AI — Clinical Safety Summary", pageWidth / 2, 36, { align: "center" });
  y = 80;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont(undefined as any, "normal");
  [
    `Patient Name: ${item.patientName || ""}`,
    `Prescription Date: ${item.recordDate || ""}`, // 🚀 FIXED: Maps to correct key
    `Scan Timestamp: ${item.scannedAt || ""}`,
  ].forEach(line => { doc.text(line, margin, y); y += 16; });
  y += 8;

  if (item.medications.length) {
    doc.setFontSize(14); doc.setFont(undefined as any, "bold");
    doc.text("Medications:", margin, y); y += 20;
    doc.setFontSize(12); doc.setFont(undefined as any, "normal");
    item.medications.forEach((med, idx) => {
      doc.text(`${idx + 1}. ${med.drugName} – ${med.dosage || ""}${med.frequency ? ", " + med.frequency : ""}`, margin, y);
      y += 14;
    });
    y += 8;
  }

  if (item.interactions.length) {
    item.interactions.forEach(int => {
      doc.setFillColor(254, 243, 199);
      doc.rect(margin - 5, y - 12, pageWidth - margin * 2 + 10, 40, "F");
      doc.setFontSize(12); doc.setFont(undefined as any, "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(`${int.drugA} × ${int.drugB}`, margin, y);
      doc.setFont(undefined as any, "normal");
      doc.text(int.plainEnglishWarning || "", margin, y + 14, { maxWidth: pageWidth - margin * 2 });
      y += 48;
    });
  } else {
    doc.setFillColor(200, 255, 200);
    doc.rect(margin - 5, y - 12, pageWidth - margin * 2 + 10, 30, "F");
    doc.setFontSize(12); doc.setFont(undefined as any, "bold"); doc.setTextColor(0, 0, 0);
    doc.text("No drug-to-drug interactions detected.", margin, y); y += 38;
  }

  if (item.lifestyleWarnings && item.lifestyleWarnings.length) {
    item.lifestyleWarnings.forEach((advice, idx) => {
      doc.setFillColor(220, 235, 255);
      doc.rect(margin - 5, y - 12, pageWidth - margin * 2 + 10, 40, "F");
      doc.setFontSize(12); doc.setFont(undefined as any, "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(`Advice ${idx + 1}:`, margin, y);
      doc.setFont(undefined as any, "normal");
      doc.text(advice, margin, y + 14, { maxWidth: pageWidth - margin * 2 });
      y += 48;
    });
  }

  const footerY = doc.internal.pageSize.getHeight() - 80;
  doc.setFontSize(10); doc.setTextColor(80, 80, 80);
  ["* This report is for informational purposes only.", "* Consult a qualified healthcare professional before changing medications."]
    .forEach((txt, i) => doc.text(txt, margin, footerY + i * 12));

  const safeName = (item.patientName || "Patient")
    .replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  doc.save(`RxScan_Safety_Summary_${safeName}.pdf`);
}

export default function PrescriptionScanner() {
  // ── Scanner state ─────────────────────────────────────────────────────────
  const [meds,               setMeds]               = useState<Medication[]>([]);
  const [interactions,       setInteractions]       = useState<Interaction[]>([]);
  const [lifestyleWarnings,  setLifestyleWarnings]  = useState<string[]>([]);
  const [interactionChecked, setInteractionChecked] = useState(false);
  const [nihFailed,          setNihFailed]          = useState(false);
  const [dataSource,         setDataSource]         = useState("");
  const [patientName,        setPatientName]        = useState("");
  const [recordDate,         setRecordDate]         = useState(""); // 🚀 FIXED: Renamed state var
  const [scanId,             setScanId]             = useState<string | null>(null);
  const [scanning,           setScanning]           = useState(false);
  const [scanError,          setScanError]          = useState("");
  const [previewUrl,         setPreviewUrl]         = useState<string | null>(null);
  const [dragOver,           setDragOver]           = useState(false);
  const [hoveredMed,         setHoveredMed]         = useState<number | null>(null);
  const [activeTab,          setActiveTab]          = useState<ScheduleTab>("Morning");

  // ── Global nav ────────────────────────────────────────────────────────────
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>("Scanner");

  // ── History state ─────────────────────────────────────────────────────────
  const [history,        setHistory]        = useState<ScanResult[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError,   setHistoryError]   = useState("");

  // ── Misc ──────────────────────────────────────────────────────────────────
  const [isMounted, setIsMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { stepIdx, progress } = useScanSteps(scanning);

  useEffect(() => { setIsMounted(true); }, []);

  // ── Menu switch ───────────────────────────────────────────────────────────
  const switchMenu = useCallback((menu: ActiveMenu) => {
    setActiveMenu(menu);
    setHoveredMed(null);
    if (menu === "Scanner") setActiveTab("Morning");
    if (menu === "History") fetchHistory();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch history ─────────────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    setHistoryError("");
    try {
      const res  = await fetch("/api/history");
      const data = await res.json();
      setHistory(data.scans ?? data.history ?? []);
    } catch {
      setHistoryError("Could not load history. Please try again.");
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // ── Upload / analyse ──────────────────────────────────────────────────────
  const handleUpload = useCallback(async (base64Image: string) => {
    setScanning(true);
    setScanError("");
    setInteractionChecked(false);
    setNihFailed(false);
    setMeds([]);
    setInteractions([]);
    setPatientName("");
    setRecordDate(""); // 🚀 FIXED: Reset correct state var
    setDataSource("");
    setScanId(null);

    try {
      const res  = await fetch("/api/analyze-prescription", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ imageData: base64Image }),
      });
      const data = await res.json();

      if (!res.ok) {
        setScanError(data.message ?? "Could not parse the document. Please upload a valid prescription image.");
        return;
      }

      const normalizedMeds: Medication[] = (data.medications ?? [])
        .filter((m: any) => m?.drugName?.trim())
        .map((m: any) => ({
          drugName:  capitaliseName(m.drugName.trim()),
          dosage:    (m.dosage    ?? "").trim(),
          frequency: (m.frequency ?? "").trim(),
        }));

      const normalizedInteractions: Interaction[] = (data.interactions ?? [])
        .filter((i: any) => i?.drugA && i?.drugB)
        .map((i: any) => ({
          drugA:               capitaliseName(i.drugA.trim()),
          drugB:               capitaliseName(i.drugB.trim()),
          severity:            i.severity === "critical" ? "critical" : "caution",
          plainEnglishWarning: (i.plainEnglishWarning ?? "").trim() ||
                               "A potential interaction was detected. Consult your pharmacist.",
        }));

      const sourceText  = (data.source ?? "").toLowerCase();
      const nihIncluded = sourceText.includes("nih") || sourceText.includes("rxnav");

      setMeds(normalizedMeds);
      setInteractions(normalizedInteractions);
      const fetchedLifestyle = (data.lifestyleWarnings ?? []) as string[];
      setLifestyleWarnings(fetchedLifestyle);
      setInteractionChecked(true);
      setNihFailed(
        normalizedMeds.length >= 2 &&
        normalizedInteractions.length === 0 &&
        nihIncluded &&
        !!data.nihError
      );
      setDataSource(data.source ?? "");
      setPatientName(data.patientName ?? "");
      setRecordDate(data.recordDate ?? ""); // 🚀 FIXED: Maps to the correct backend key

      const extractedId =
        data.id ||
        data.scanId ||
        data.vitalsId ||
        (data.prescription && data.prescription.id) ||
        (data.log && data.log.id) ||
        (data.scan && data.scan.id) ||
        (data.data && data.data.id);

      console.log("🎯 Biometric Tracking Engine Token Sync Success:", extractedId);
      setScanId(extractedId ?? null);
    } catch (e: any) {
      console.error("Analysis route crash logs:", e);
      setScanError("Could not reach the clinical analysis engine. Please check your connection and try again.");
    } finally {
      setScanning(false);
    }
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file) return;
    const allowed = ["image/jpeg","image/png","image/gif","image/webp","application/pdf"];
    if (!allowed.includes(file.type)) { setScanError("Unsupported file type. Please upload a JPG, PNG, or PDF."); return; }
    if (file.size > 10 * 1024 * 1024)  { setScanError("File too large. Please upload an image under 10 MB."); return; }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = () => handleUpload(reader.result as string);
    reader.readAsDataURL(file);
  }, [handleUpload, previewUrl]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = "";
  };
  const onDrop      = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragOver(true); };

  // ── Derived scanner state ─────────────────────────────────────────────────
  const totalMeds     = meds.length;
  const criticalCount = interactions.filter(i => i.severity === "critical").length;
  const cautionCount  = interactions.filter(i => i.severity === "caution").length;
  const warnCount     = interactions.length;
  const hasResults    = totalMeds > 0;
  const tabMeds       = getMedsForTab(meds, activeTab);

  type IPState = "idle" | "warnings" | "allclear" | "advisory";
  const ipState: IPState =
    !interactionChecked   ? "idle"
    : warnCount > 0       ? "warnings"
    : nihFailed           ? "advisory"
    : "allclear";

  if (!isMounted) return <div className="root" />;

  return (
    <div className="root">
      <style>{CSS}</style>

      {/* ambient blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      <div className="grid-overlay" />

      <div className="container">

        {/* ── HEADER ───────────────────────────────────────────────────────── */}
        <header className="header">
          <div className="header-left">
            <div className="logo-cross">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="7"  y="1" width="2" height="14" rx="1" fill="white"/>
                <rect x="1"  y="7" width="14" height="2" rx="1" fill="white"/>
              </svg>
            </div>
            <div>
              <div className="logo-name">RxScan</div>
              <span className="logo-tag">Clinical AI</span>
            </div>
          </div>

          <nav className="nav">
            {(["Scanner","History","Database"] as ActiveMenu[]).map(menu => (
              <button
                key={menu}
                className={`nav-btn${activeMenu === menu ? " active" : ""}`}
                onClick={() => switchMenu(menu)}
              >
                {menu}
              </button>
            ))}
          </nav>

          <div className="header-right">
            <div className="status-pill">
              <div className="pulse-dot" />
              AI Online
            </div>
          </div>
        </header>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="hero">
          <div className="hero-label">
            <div className="hero-line" />
            Prescription Intelligence
            <div className="hero-line" />
          </div>
          <h1 className="hero-h1">
            Analyze your prescription<br />
            <em>with clinical precision.</em>
          </h1>
          <p className="hero-sub">
            Upload any prescription image. Our AI extracts medications, cross-references
            the NIH drug interaction database, and builds your personalised daily
            schedule — in seconds.
          </p>
        </section>

        {/* ── STAT CARDS ───────────────────────────────────────────────────── */}
        <div className="stats-row">
          <div className="stat-card blue">
            <div className="stat-num">{activeMenu === "Scanner" ? totalMeds : "—"}</div>
            <div className="stat-label">Medications</div>
            <div className="stat-sub">detected in scan</div>
          </div>
          <div className="stat-card emerald">
            <div className="stat-num">
              {activeMenu === "Scanner" ? new Set(meds.map(m => m.drugName)).size : "—"}
            </div>
            <div className="stat-label">Compounds</div>
            <div className="stat-sub">unique substances</div>
          </div>
          <div className={`stat-card ${
            activeMenu !== "Scanner" ? "muted"
            : criticalCount > 0     ? "alert"
            : warnCount > 0         ? "amber"
            : "muted"
          }`}>
            <div className="stat-num">{activeMenu === "Scanner" ? warnCount : "—"}</div>
            <div className="stat-label">Interactions</div>
            <div className="stat-sub">
              {activeMenu !== "Scanner" ? "switch to scanner"
              : !interactionChecked     ? "awaiting scan"
              : warnCount === 0         ? "none detected"
              : `${criticalCount} critical · ${cautionCount} caution`}
            </div>
          </div>
          <div className="stat-card violet">
            <div className="stat-num">NIH</div>
            <div className="stat-label">Database</div>
            <div className="stat-sub">RxNav · RxNorm</div>
          </div>
        </div>

        {/* ── VIEW: SCANNER ────────────────────────────────────────────────── */}
        {activeMenu === "Scanner" && (
          <div key="view-scanner" className="view-scanner">

            {/* Upload zone */}
            <div className="upload-section">
              <div className="section-label">
                <span className="section-num">01</span>
                Upload Prescription
              </div>

              <div
                className={`dropzone${dragOver ? " dragover" : ""}${scanning ? " scanning-state" : ""}`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={() => setDragOver(false)}
                onClick={() => !scanning && inputRef.current?.click()}
              >
                <div className="dropzone-inner">

                  {/* idle — no preview */}
                  {!scanning && !previewUrl && (
                    <>
                      <div className="upload-icon-ring">
                        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                          <path d="M13 4v14M13 4L8 9M13 4l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3 19v2.5A1.5 1.5 0 004.5 23h17A1.5 1.5 0 0023 21.5V19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className="dropzone-title">Drop your prescription here</div>
                      <div className="dropzone-hint">JPG · PNG · PDF — up to 10 MB. Handwritten &amp; printed supported.</div>
                      <button className="upload-btn" onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                          <path d="M6.5 1v8M6.5 1L3 4.5M6.5 1L10 4.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M1 9.5v2A.5.5 0 001.5 12h10a.5.5 0 00.5-.5v-2" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                        Choose file
                      </button>
                    </>
                  )}

                  {/* preview */}
                  {previewUrl && !scanning && (
                    <div className="preview-wrap">
                      <img src={previewUrl} alt="Prescription preview" className="preview-img" />
                      <button className="preview-change" onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6H10M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Change image
                      </button>
                    </div>
                  )}

                  {/* scanning animation */}
                  {scanning && (
                    <div className="scan-ui">
                      <div className="scan-radar">
                        <div className="radar-ring ring-1" /><div className="radar-ring ring-2" /><div className="radar-ring ring-3" />
                        <div className="radar-center">
                          <svg className="spinner" width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" strokeDasharray="22 22" strokeLinecap="round"/>
                          </svg>
                        </div>
                      </div>
                      <div className="scan-steps">
                        {SCAN_STEPS.map((s, i) => (
                          <div key={s.id} className={`scan-step ${i < stepIdx ? "done" : i === stepIdx ? "active" : "idle"}`}>
                            <div className="scan-step-icon">
                              {i < stepIdx
                                ? <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                : i === stepIdx
                                ? <div style={{width:5,height:5,borderRadius:"50%",background:"currentColor"}}/>
                                : null}
                            </div>
                            <span>{s.label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="scan-progress-track">
                        <div className="scan-progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="scan-pct">{progress}%</div>
                    </div>
                  )}

                </div>
              </div>

              <input ref={inputRef} type="file" accept="image/*,.pdf" style={{ display:"none" }} onChange={onInputChange} />

              {scanError && !scanning && (
                <div className="error-bar">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1.5L12.5 12H1.5L7 1.5Z" stroke="#f87171" strokeWidth="1.2" strokeLinejoin="round"/>
                    <path d="M7 5.5V8M7 9.5V10" stroke="#f87171" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  {scanError}
                </div>
              )}
            </div>

            {/* ── RESULTS BLOCK (guarded by hasResults) ───────────────────── */}
            {hasResults && (
              <div className="results">
                <div className="section-label">
                  <span className="section-num">02</span>
                  Analysis Results
                </div>

                <div className="results-grid">

                  {/* Medications panel */}
                  <div className="panel">
                    <div className="panel-header">
                      <div className="panel-title-group">
                        <div className="panel-icon pi-blue">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <ellipse cx="7" cy="7" rx="4" ry="2.5" transform="rotate(45 7 7)" stroke="currentColor" strokeWidth="1.2"/>
                            <path d="M4.05 4.05L9.95 9.95" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <span className="panel-title">Medications</span>
                      </div>
                      <span className="panel-count">{meds.length} found</span>
                    </div>

                    <div className="med-list">
                      {meds.map((med, i) => (
                        <div
                          key={i}
                          className={`med-row${hoveredMed === i ? " hovered" : ""}`}
                          style={{ animationDelay: `${i * 55}ms` }}
                          onMouseEnter={() => setHoveredMed(i)}
                          onMouseLeave={() => setHoveredMed(null)}
                        >
                          <div className="med-letter">{med.drugName.charAt(0).toUpperCase()}</div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div className="med-name">{med.drugName}</div>
                            <div className="med-meta">
                              {[med.dosage, med.frequency].filter(Boolean).join(" · ") || "—"}
                            </div>
                          </div>
                          <div className="med-badge">Active</div>
                        </div>
                      ))}
                    </div>

                    <div className="conf-section">
                      <div className="conf-row">
                        <span>AI extraction confidence</span>
                        <span className="conf-pct">94%</span>
                      </div>
                      <div className="conf-track">
                        <div className="conf-fill" style={{ width:"94%" }} />
                      </div>
                    </div>
                  </div>

                  {/* Interactions panel */}
                  <div className="panel">
                    <div className="panel-header">
                      <div className="panel-title-group">
                        <div className={`panel-icon ${
                          ipState === "warnings" ? "pi-red"
                          : ipState === "advisory" ? "pi-amber"
                          : "pi-green"
                        }`}>
                          {ipState === "warnings" ? (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M7 1.5L12.5 12H1.5L7 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                              <path d="M7 5.5V8M7 9.5V10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                            </svg>
                          ) : ipState === "advisory" ? (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
                              <path d="M7 4.5V7.5M7 9V9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
                              <path d="M4.5 7L6.5 9L9.5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <span className="panel-title">Interaction Check</span>
                      </div>
                      {ipState === "warnings" && (
                        <span className={`panel-count${criticalCount > 0 ? " danger" : ""}`}>
                          {warnCount} found
                        </span>
                      )}
                    </div>

                    {ipState === "warnings" && (
                      <div className="warn-list">
                        <div className="warn-disclaimer">⚕ Always consult your pharmacist before changing medications.</div>
                        {interactions.map((item, i) => (
                          <div key={i} className={`warn-card ${item.severity}`} style={{ animationDelay:`${i*65}ms` }}>
                            <div className={`severity-pill ${item.severity}`}>
                              {item.severity === "critical" ? "Critical" : "Caution"}
                            </div>
                            <div className="warn-drugs">
                              <span className="drug-tag">{item.drugA}</span>
                              <span className="plus-icon">×</span>
                              <span className="drug-tag">{item.drugB}</span>
                            </div>
                            <p className="warn-text">{item.plainEnglishWarning}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {ipState === "allclear" && (
                      <div className="safe-state">
                        <div className="safe-icon-wrap">
                          <div className="safe-ring-outer" />
                          <div className="safe-ring-inner" />
                          <svg className="safe-check" width="28" height="28" viewBox="0 0 28 28" fill="none">
                            <path d="M7 14L12 19L21 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="safe-title">No interactions detected</div>
                        <div className="safe-sub">
                          Based on the NIH RxNorm database, no known interactions were found.
                          Always confirm with your pharmacist.
                        </div>
                      </div>
                    )}

                    {ipState === "advisory" && (
                      <div className="advisory-state">
                        <div className="advisory-icon-wrap">
                          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                            <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M11 7v5M11 14v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <div className="advisory-title">Interaction data may be incomplete</div>
                        <div className="advisory-sub">
                          The NIH check returned no results, but this may reflect a connectivity issue rather
                          than confirmed safety. Please consult your pharmacist to verify this combination.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Export button */}
                <div style={{ margin:"20px 0", textAlign:"center" }}>
                  <button
                    className="upload-btn"
                    onClick={() => exportPDF({
                      patientName,
                      recordDate,           // 🚀 FIXED: Pass correct state var
                      scannedAt: new Date().toISOString(),
                      medications: meds,
                      interactions,
                      lifestyleWarnings,
                    })}
                  >
                    Export Clinical Safety Summary PDF
                  </button>
                </div>

                {/* Lifestyle & Dietary Shield panel */}
                <div className="panel">
                  <div className="panel-header">
                    <div className="panel-title-group">
                      <div className="panel-icon pi-amber">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M7 1.5L12.5 12H1.5L7 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="panel-title">Lifestyle &amp; Dietary Shield</span>
                    </div>
                    {lifestyleWarnings.length > 0 && (
                      <span className="panel-count">{lifestyleWarnings.length} advice</span>
                    )}
                  </div>
                  {lifestyleWarnings.length === 0 ? (
                    <div className="safe-state">
                      <div className="safe-title">No specific dietary restrictions</div>
                    </div>
                  ) : (
                    <div className="warn-list">
                      {lifestyleWarnings.map((msg, i) => (
                        <div key={i} className="warn-card caution" style={{ animationDelay: `${i * 65}ms` }}>
                          <p className="warn-text">{msg}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ==================== VITALS DASHBOARD (INDEPENDENT LAYER) ==================== */}
            <div style={{ marginBottom: "24px" }}>
              <VitalsDashboard scanId={scanId} />
            </div>

            {/* ── SCHEDULE PANEL ── */}
            {hasResults && (
              <div className="schedule-panel">
                <div className="section-label" style={{ marginBottom:"20px" }}>
                  <span className="section-num">03</span>
                  Daily Medication Schedule
                </div>

                <div className="tab-bar">
                  {(["Morning","Afternoon","Evening"] as ScheduleTab[]).map(tab => (
                    <button key={tab} className={`tab-btn${activeTab === tab ? " tab-active" : ""}`} onClick={() => setActiveTab(tab)}>
                      <span className="tab-emoji">{tab === "Morning" ? "🌅" : tab === "Afternoon" ? "☀️" : "🌙"}</span>
                      <span>{tab}</span>
                    </button>
                  ))}
                </div>

                <div className="timeline">
                  {tabMeds.length === 0 ? (
                    <div className="tl-empty">
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ opacity:0.25 }}>
                        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M16 10V16L20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <p>No medications scheduled for {activeTab.toLowerCase()}.</p>
                    </div>
                  ) : tabMeds.map((med, i) => (
                    <div key={i} className="tl-item" style={{ animationDelay:`${i*60}ms` }}>
                      <div className="tl-time-col">
                        <div className="tl-time">
                          {activeTab === "Morning" ? "08:00" : activeTab === "Afternoon" ? "13:00" : "20:00"}
                        </div>
                        {i < tabMeds.length - 1 && <div className="tl-bar" />}
                      </div>
                      <div className="tl-card">
                        <div className="tl-dot" />
                        <div className="tl-med-name">{med.drugName}</div>
                        <div className="tl-med-dose">{med.dosage || "—"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ── VIEW: HISTORY ────────────────────────────────────────────────── */}
        {activeMenu === "History" && (
          <div key="view-history" className="view-history">
            <div className="section-label">
              <span className="section-num">History</span>
              Prescription Scan History
            </div>

            {loadingHistory && (
              <div className="scan-ui" style={{ textAlign:"center", padding:"40px 0" }}>
                <div className="scan-radar" style={{ margin:"0 auto 20px" }}>
                  <div className="radar-ring ring-1" /><div className="radar-ring ring-2" /><div className="radar-ring ring-3" />
                  <div className="radar-center">
                    <svg className="spinner" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" strokeDasharray="22 22" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
                <div className="scan-pct">Loading history…</div>
              </div>
            )}

            {!loadingHistory && historyError && (
              <div className="error-bar">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1.5L12.5 12H1.5L7 1.5Z" stroke="#f87171" strokeWidth="1.2" strokeLinejoin="round"/>
                  <path d="M7 5.5V8M7 9.5V10" stroke="#f87171" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                {historyError}
              </div>
            )}

            {!loadingHistory && !historyError && history.length === 0 && (
              <div className="tl-empty">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ opacity:0.25 }}>
                  <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M16 10V16L20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p>No scans in history yet.</p>
              </div>
            )}

            {!loadingHistory && !historyError && history.length > 0 && (
              <div className="history-list">
                {history.map((scan, i) => {
                  const scanInteractions = scan.interactions ?? scan.drugInteractions ?? [];
                  const scanMeds         = scan.medications ?? [];
                  return (
                    <div key={scan.id ?? i} className="history-card" style={{ animationDelay:`${i*60}ms` }}>
                      <div className="history-card-header">
                        <div>
                          <div className="history-patient">{scan.patientName || "Unknown Patient"}</div>
                          <div className="history-date">{new Date(scan.scannedAt).toLocaleString()}</div>
                        </div>
                        <button
                          className="upload-btn"
                          style={{ padding:"6px 12px", fontSize:"12px" }}
                          onClick={() => exportPDF({
                            patientName:  scan.patientName,
                            recordDate:   scan.recordDate, // 🚀 FIXED: Maps to the correct Prisma database key
                            scannedAt:    scan.scannedAt,
                            medications:  scanMeds,
                            interactions: scanInteractions,
                          })}
                        >
                          Export PDF
                        </button>
                      </div>
                      <div className="history-card-body">
                        <div className="history-col">
                          <div className="history-col-title">Medications ({scanMeds.length})</div>
                          {scanMeds.map((med, j) => (
                            <div key={j} className="history-med-row">
                              {med.drugName} — {med.dosage}{med.frequency ? `, ${med.frequency}` : ""}
                            </div>
                          ))}
                        </div>
                        <div className="history-col">
                          <div className="history-col-title">Interactions ({scanInteractions.length})</div>
                          {scanInteractions.length > 0
                            ? scanInteractions.map((int, j) => (
                                <div key={j} className="history-int-row">
                                  <span className={`history-sev ${int.severity}`}>
                                    {int.severity === "critical" ? "⚠" : "!"}
                                  </span>
                                  {int.drugA} × {int.drugB}
                                </div>
                              ))
                            : <div className="history-safe">No interactions detected</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── VIEW: DATABASE ───────────────────────────────────────────────── */}
        {activeMenu === "Database" && (
          <div key="view-database" className="view-database">
            <div className="section-label">
              <span className="section-num">Database</span>
              NIH Drug Reference
            </div>
            <div className="db-placeholder">
              <div className="db-icon">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <ellipse cx="18" cy="10" rx="14" ry="5"  stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M4 10v8c0 2.76 6.27 5 14 5s14-2.24 14-5v-8" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M4 18v8c0 2.76 6.27 5 14 5s14-2.24 14-5v-8" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </div>
              <div className="db-title">NIH RxNav Database</div>
              <div className="db-sub">
                Drug reference search coming soon. Scan a prescription to query the NIH
                RxNorm database for individual drug profiles, contraindications, and interaction
                histories.
              </div>
            </div>
          </div>
        )}

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <div className="logo-cross" style={{ width:22, height:22, borderRadius:4 }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <rect x="4.25" y="0.5"  width="1.5" height="9"   rx="0.75" fill="white"/>
                  <rect x="0.5"  y="4.25" width="9"   height="1.5" rx="0.75" fill="white"/>
                </svg>
              </div>
              RxScan AI
            </div>
            {dataSource && activeMenu === "Scanner" && (
              <div className="footer-source">Source: {dataSource}</div>
            )}
            <div className="footer-legal">
              Not a substitute for professional medical advice.{" "}
              <a href="#">Privacy</a> · <a href="#">Terms</a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// STYLES
// ═════════════════════════════════════════════════════════════════════════════
const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:          #08090b;
    --bg-card:     #0e1014;
    --bg-panel:    #111318;
    --bg-hover:    #181b21;
    --border:      rgba(255,255,255,0.07);
    --border-md:   rgba(255,255,255,0.11);
    --text-1:      #f0f2f5;
    --text-2:      #8b909c;
    --text-3:      #5a5f6b;
    --blue:        #3b82f6;
    --blue-dim:    rgba(59,130,246,0.12);
    --blue-glow:   rgba(59,130,246,0.25);
    --emerald:     #10b981;
    --emerald-dim: rgba(16,185,129,0.12);
    --amber:       #f59e0b;
    --amber-dim:   rgba(245,158,11,0.12);
    --red:         #ef4444;
    --red-dim:     rgba(239,68,68,0.12);
    --violet:      #8b5cf6;
    --violet-dim:  rgba(139,92,246,0.12);
    --radius-sm:   8px;
    --radius-md:   12px;
    --radius-lg:   16px;
    --radius-xl:   20px;
    --font:        'IBM Plex Mono', 'Fira Code', 'Courier New', monospace;
    --font-sans:   'DM Sans', 'Helvetica Neue', Arial, sans-serif;
  }

  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap');
  html, body { background: var(--bg); color: var(--text-1); font-family: var(--font-sans); }

  /* ── Root / ambient ─────────────────────────────────────────── */
  .root { min-height:100vh; background:var(--bg); position:relative; overflow-x:hidden; }
  .blob { position:fixed; border-radius:50%; filter:blur(120px); pointer-events:none; z-index:0; opacity:0.18; }
  .blob-1 { width:600px; height:600px; background:#1e3a8a; top:-200px; left:-200px; }
  .blob-2 { width:500px; height:500px; background:#064e3b; bottom:20%; right:-150px; }
  .blob-3 { width:300px; height:300px; background:#4c1d95; top:40%; left:30%; }
  .grid-overlay {
    position:fixed; inset:0; pointer-events:none; z-index:0;
    background-image:
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size:40px 40px;
  }

  /* ── Container ──────────────────────────────────────────────── */
  .container { max-width:1100px; margin:0 auto; padding:0 24px 80px; position:relative; z-index:1; }

  /* ── Header ─────────────────────────────────────────────────── */
  .header { display:flex; align-items:center; justify-content:space-between; padding:24px 0 32px; border-bottom:1px solid var(--border); margin-bottom:52px; }
  .header-left { display:flex; align-items:center; gap:12px; }
  .logo-cross { width:36px; height:36px; display:flex; align-items:center; justify-content:center; background:var(--blue); border-radius:var(--radius-sm); color:#fff; flex-shrink:0; }
  .logo-name { font-family:var(--font); font-weight:600; font-size:18px; letter-spacing:-0.02em; color:var(--text-1); }
  .logo-tag { display:block; font-family:var(--font); font-size:10px; color:var(--text-3); letter-spacing:0.08em; text-transform:uppercase; margin-top:1px; }
  .nav { display:flex; gap:2px; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-md); padding:3px; }
  .nav-btn { padding:6px 14px; border-radius:8px; font-size:13px; font-weight:500; color:var(--text-2); cursor:pointer; border:none; background:transparent; transition:all 0.15s; font-family:var(--font-sans); }
  .nav-btn:hover, .nav-btn.active { color:var(--text-1); background:var(--bg-hover); }
  .header-right { display:flex; align-items:center; gap:10px; }
  .status-pill { display:flex; align-items:center; gap:6px; padding:5px 12px; border-radius:99px; background:var(--emerald-dim); border:1px solid rgba(16,185,129,0.2); font-size:12px; font-weight:500; color:var(--emerald); font-family:var(--font); }
  .pulse-dot { width:6px; height:6px; border-radius:50%; background:var(--emerald); animation:pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }

  /* ── Hero ───────────────────────────────────────────────────── */
  .hero { margin-bottom:48px; }
  .hero-label { display:inline-flex; align-items:center; gap:8px; font-family:var(--font); font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--blue); margin-bottom:18px; }
  .hero-line { width:24px; height:1px; background:var(--blue); }
  .hero-h1 { font-family:var(--font-sans); font-size:clamp(36px,5vw,58px); font-weight:300; line-height:1.1; letter-spacing:-0.03em; color:var(--text-1); margin-bottom:18px; }
  .hero-h1 em { font-style:italic; font-weight:300; color:var(--blue); }
  .hero-sub { font-size:16px; font-weight:300; color:var(--text-2); max-width:540px; line-height:1.65; }

  /* ── Stats ──────────────────────────────────────────────────── */
  .stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:40px; }
  @media(max-width:680px){ .stats-row{ grid-template-columns:repeat(2,1fr); } }
  .stat-card { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg); padding:18px 20px; transition:border-color 0.2s; position:relative; overflow:hidden; }
  .stat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; border-radius:var(--radius-lg) var(--radius-lg) 0 0; }
  .stat-card.blue::before    { background:var(--blue);    }
  .stat-card.emerald::before { background:var(--emerald); }
  .stat-card.alert::before   { background:var(--red);     }
  .stat-card.amber::before   { background:var(--amber);   }
  .stat-card.muted::before   { background:var(--text-3);  }
  .stat-card.violet::before  { background:var(--violet);  }
  .stat-card:hover { border-color:var(--border-md); }
  .stat-num   { font-family:var(--font); font-size:32px; font-weight:600; color:var(--text-1); line-height:1; margin-bottom:6px; }
  .stat-label { font-size:13px; font-weight:500; color:var(--text-2); margin-bottom:3px; }
  .stat-sub   { font-family:var(--font); font-size:11px; color:var(--text-3); }

  /* ── Section label ──────────────────────────────────────────── */
  .section-label { display:flex; align-items:center; gap:10px; font-family:var(--font); font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text-3); margin-bottom:16px; }
  .section-num { font-family:var(--font); color:var(--blue); font-size:11px; }

  /* ── Upload zone ────────────────────────────────────────────── */
  .upload-section { margin-bottom:40px; }
  .dropzone { border:1px solid var(--border-md); border-radius:var(--radius-xl); background:var(--bg-card); min-height:240px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s; position:relative; overflow:hidden; }
  .dropzone::after { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 50% 0%,rgba(59,130,246,0.06),transparent 70%); pointer-events:none; }
  .dropzone:hover, .dropzone.dragover { border-color:var(--blue); background:rgba(59,130,246,0.04); }
  .dropzone.scanning-state { cursor:default; }
  .dropzone-inner { padding:40px; text-align:center; width:100%; }
  .upload-icon-ring { width:72px; height:72px; border-radius:50%; border:1px solid var(--border-md); display:flex; align-items:center; justify-content:center; margin:0 auto 20px; color:var(--blue); position:relative; background:var(--blue-dim); }
  .upload-icon-ring::before { content:''; position:absolute; inset:-8px; border-radius:50%; border:1px solid rgba(59,130,246,0.15); }
  .dropzone-title { font-size:18px; font-weight:500; color:var(--text-1); margin-bottom:8px; }
  .dropzone-hint  { font-size:13px; color:var(--text-3); margin-bottom:24px; }
  .upload-btn { display:inline-flex; align-items:center; gap:7px; padding:9px 20px; border-radius:var(--radius-sm); background:var(--blue); color:#fff; font-size:13px; font-weight:500; border:none; cursor:pointer; font-family:var(--font-sans); transition:opacity 0.15s; }
  .upload-btn:hover { opacity:0.85; }
  .preview-wrap { position:relative; display:inline-block; }
  .preview-img  { max-height:180px; max-width:100%; border-radius:var(--radius-md); border:1px solid var(--border-md); display:block; margin:0 auto 12px; }
  .preview-change { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:var(--radius-sm); border:1px solid var(--border-md); background:transparent; color:var(--text-2); font-size:12px; cursor:pointer; font-family:var(--font-sans); transition:all 0.15s; }
  .preview-change:hover { color:var(--text-1); }

  /* ── Scan animation ─────────────────────────────────────────── */
  .scan-ui { width:100%; max-width:420px; margin:0 auto; }
  .scan-radar { width:80px; height:80px; position:relative; margin:0 auto 28px; display:flex; align-items:center; justify-content:center; }
  .radar-ring { position:absolute; border-radius:50%; border:1px solid rgba(59,130,246,0.3); animation:ring-grow 2.5s infinite ease-out; }
  .ring-1 { inset:0;    animation-delay:0s;   }
  .ring-2 { inset:-14px; animation-delay:0.8s; }
  .ring-3 { inset:-28px; animation-delay:1.6s; }
  @keyframes ring-grow { 0%{opacity:.8;transform:scale(.9)} 100%{opacity:0;transform:scale(1.3)} }
  .radar-center { width:44px; height:44px; border-radius:50%; background:var(--blue-dim); border:1px solid rgba(59,130,246,0.4); display:flex; align-items:center; justify-content:center; color:var(--blue); position:relative; z-index:1; }
  .scan-steps { display:flex; flex-direction:column; gap:10px; margin-bottom:24px; }
  .scan-step  { display:flex; align-items:center; gap:10px; font-family:var(--font); font-size:12px; color:var(--text-3); transition:color 0.3s; }
  .scan-step.active { color:var(--blue);    }
  .scan-step.done   { color:var(--emerald); }
  .scan-step-icon { width:20px; height:20px; border-radius:50%; border:1px solid currentColor; display:flex; align-items:center; justify-content:center; font-size:9px; flex-shrink:0; }
  .scan-step.active .scan-step-icon { background:var(--blue-dim);    }
  .scan-step.done   .scan-step-icon { background:var(--emerald-dim); }
  .scan-progress-track { height:2px; background:var(--border); border-radius:1px; margin-bottom:8px; overflow:hidden; }
  .scan-progress-fill  { height:100%; background:linear-gradient(90deg,var(--blue),#60a5fa); border-radius:1px; transition:width 0.8s ease; }
  .scan-pct { font-family:var(--font); font-size:11px; color:var(--text-3); text-align:right; }

  /* ── Error bar ──────────────────────────────────────────────── */
  .error-bar { display:flex; align-items:center; gap:8px; margin-top:12px; padding:10px 14px; border-radius:var(--radius-sm); background:var(--red-dim); border:1px solid rgba(239,68,68,0.2); color:#f87171; font-size:13px; }

  /* ── Results ────────────────────────────────────────────────── */
  .results { animation:fadeUp 0.4s ease; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
  .results-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
  @media(max-width:680px){ .results-grid{ grid-template-columns:1fr; } }

  /* ── Panel ──────────────────────────────────────────────────── */
  .panel { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg); overflow:hidden; }
  .panel-header { display:flex; align-items:center; justify-content:space-between; padding:16px 18px; border-bottom:1px solid var(--border); }
  .panel-title-group { display:flex; align-items:center; gap:9px; }
  .panel-icon { width:28px; height:28px; border-radius:var(--radius-sm); display:flex; align-items:center; justify-content:center; }
  .pi-blue  { background:var(--blue-dim);    color:var(--blue);    }
  .pi-red   { background:var(--red-dim);     color:var(--red);     }
  .pi-green { background:var(--emerald-dim); color:var(--emerald); }
  .pi-amber { background:var(--amber-dim);   color:var(--amber);   }
  .panel-title { font-size:14px; font-weight:500; color:var(--text-1); }
  .panel-count { font-family:var(--font); font-size:12px; color:var(--text-3); background:var(--bg-hover); border:1px solid var(--border); padding:2px 8px; border-radius:99px; }
  .panel-count.danger { color:var(--red); background:var(--red-dim); border-color:rgba(239,68,68,0.2); }

  /* ── Med list ───────────────────────────────────────────────── */
  .med-list { padding:8px 0; }
  .med-row  { display:flex; align-items:center; gap:12px; padding:10px 18px; transition:background 0.15s; cursor:default; animation:fadeUp 0.3s ease both; }
  .med-row:hover, .med-row.hovered { background:var(--bg-hover); }
  .med-letter { width:34px; height:34px; border-radius:8px; background:var(--blue-dim); color:var(--blue); display:flex; align-items:center; justify-content:center; font-family:var(--font); font-weight:600; font-size:14px; flex-shrink:0; }
  .med-name  { font-size:14px; font-weight:500; color:var(--text-1); }
  .med-meta  { font-size:12px; color:var(--text-3); margin-top:2px; font-family:var(--font); }
  .med-badge { margin-left:auto; font-size:10px; font-family:var(--font); padding:2px 8px; border-radius:99px; background:var(--emerald-dim); color:var(--emerald); border:1px solid rgba(16,185,129,0.2); flex-shrink:0; }
  .conf-section { border-top:1px solid var(--border); padding:12px 18px; }
  .conf-row { display:flex; justify-content:space-between; font-size:12px; color:var(--text-3); margin-bottom:6px; font-family:var(--font); }
  .conf-pct { color:var(--blue); }
  .conf-track { height:3px; background:var(--border); border-radius:2px; overflow:hidden; }
  .conf-fill  { height:100%; background:linear-gradient(90deg,var(--blue),#60a5fa); border-radius:2px; transition:width 1s ease 0.3s; }

  /* ── Interaction panel states ───────────────────────────────── */
  .warn-disclaimer { margin:12px 18px; padding:8px 12px; border-radius:var(--radius-sm); background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.18); font-size:12px; color:#fbbf24; font-family:var(--font); }
  .warn-list { padding-bottom:4px; }
  .warn-card { margin:8px 18px; padding:14px 16px; border-radius:var(--radius-md); border:1px solid; animation:fadeUp 0.35s ease both; }
  .warn-card.critical { background:rgba(239,68,68,0.06); border-color:rgba(239,68,68,0.25); }
  .warn-card.caution  { background:rgba(245,158,11,0.06); border-color:rgba(245,158,11,0.2); }
  .severity-pill { display:inline-block; font-size:10px; font-family:var(--font); letter-spacing:0.06em; text-transform:uppercase; padding:2px 8px; border-radius:99px; margin-bottom:10px; }
  .severity-pill.critical { background:var(--red-dim);   color:var(--red);   border:1px solid rgba(239,68,68,0.25); }
  .severity-pill.caution  { background:var(--amber-dim); color:var(--amber); border:1px solid rgba(245,158,11,0.2); }
  .warn-drugs { display:flex; align-items:center; gap:8px; margin-bottom:8px; flex-wrap:wrap; }
  .drug-tag    { font-family:var(--font); font-size:13px; font-weight:500; color:var(--text-1); background:var(--bg-hover); border:1px solid var(--border-md); padding:3px 10px; border-radius:var(--radius-sm); }
  .plus-icon  { color:var(--text-3); font-size:14px; }
  .warn-text  { font-size:13px; color:var(--text-2); line-height:1.5; }
  .safe-state { padding:40px 24px; text-align:center; }
  .safe-icon-wrap { width:70px; height:70px; position:relative; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; }
  .safe-ring-outer { position:absolute; inset:0; border-radius:50%; border:1px solid rgba(16,185,129,0.2); animation:safe-pulse 2.5s ease-in-out infinite; }
  .safe-ring-inner { position:absolute; inset:10px; border-radius:50%; background:var(--emerald-dim); border:1px solid rgba(16,185,129,0.3); }
  @keyframes safe-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.08);opacity:.6} }
  .safe-check { position:relative; z-index:1; color:var(--emerald); }
  .safe-title { font-size:16px; font-weight:500; color:var(--text-1); margin-bottom:8px; }
  .safe-sub   { font-size:13px; color:var(--text-3); max-width:260px; margin:0 auto; line-height:1.55; }
  .advisory-state { padding:32px 24px; text-align:center; }
  .advisory-icon-wrap { width:64px; height:64px; border-radius:50%; background:var(--amber-dim); border:1px solid rgba(245,158,11,0.25); display:flex; align-items:center; justify-content:center; color:var(--amber); margin:0 auto 16px; }
  .advisory-title { font-size:15px; font-weight:500; color:var(--text-1); margin-bottom:8px; }
  .advisory-sub   { font-size:12px; color:var(--text-3); line-height:1.55; max-width:280px; margin:0 auto; font-family:var(--font); }

  /* ── Schedule ───────────────────────────────────────────────── */
  .schedule-panel { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg); padding:24px; }
  .tab-bar { display:flex; gap:4px; background:var(--bg-panel); border:1px solid var(--border); border-radius:var(--radius-md); padding:4px; margin-bottom:28px; width:fit-content; }
  .tab-btn { display:flex; align-items:center; gap:6px; padding:7px 16px; border-radius:8px; font-size:13px; font-weight:500; color:var(--text-2); cursor:pointer; border:none; background:transparent; font-family:var(--font-sans); transition:all 0.15s; }
  .tab-btn:hover { color:var(--text-1); }
  .tab-btn.tab-active { background:var(--bg-hover); color:var(--text-1); }
  .tab-emoji { font-size:14px; }
  .timeline { display:flex; flex-direction:column; }
  .tl-empty { display:flex; flex-direction:column; align-items:center; gap:12px; padding:48px 0; color:var(--text-3); font-size:13px; }
  .tl-item  { display:flex; gap:16px; align-items:stretch; animation:fadeUp 0.3s ease both; }
  .tl-time-col { display:flex; flex-direction:column; align-items:center; width:56px; flex-shrink:0; padding-top:2px; }
  .tl-time { font-family:var(--font); font-size:11px; color:var(--blue); white-space:nowrap; margin-bottom:4px; }
  .tl-bar  { flex:1; width:1px; background:var(--border); min-height:20px; }
  .tl-card { flex:1; background:var(--bg-panel); border:1px solid var(--border); border-radius:var(--radius-md); padding:12px 16px; margin-bottom:10px; display:flex; align-items:center; gap:10px; }
  .tl-dot  { width:8px; height:8px; border-radius:50%; background:var(--blue); flex-shrink:0; }
  .tl-med-name { font-size:14px; font-weight:500; color:var(--text-1); }
  .tl-med-dose { margin-left:auto; font-family:var(--font); font-size:12px; color:var(--text-3); white-space:nowrap; }

  /* ── History view ───────────────────────────────────────────── */
  .view-history { animation:fadeUp 0.35s ease; }
  .history-list { display:flex; flex-direction:column; gap:16px; }
  .history-card { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg); overflow:hidden; animation:fadeUp 0.35s ease both; }
  .history-card-header { display:flex; justify-content:space-between; align-items:center; padding:14px 18px; border-bottom:1px solid var(--border); }
  .history-patient { font-size:15px; font-weight:500; color:var(--text-1); }
  .history-date    { font-size:12px; color:var(--text-3); margin-top:2px; font-family:var(--font); }
  .history-card-body { display:grid; grid-template-columns:1fr 1fr; gap:12px; padding:14px 18px; }
  @media(max-width:580px){ .history-card-body{ grid-template-columns:1fr; } }
  .history-col       { display:flex; flex-direction:column; gap:6px; }
  .history-col-title { font-size:13px; font-weight:500; color:var(--text-1); margin-bottom:4px; }
  .history-med-row    { font-size:13px; color:var(--text-2); }
  .history-int-row    { display:flex; align-items:center; gap:6px; font-size:13px; color:var(--text-2); }
  .history-sev.critical { color:var(--red); }
  .history-sev.caution  { color:var(--amber); }
  .history-safe { font-size:13px; color:var(--emerald); }

  /* ── Database view ──────────────────────────────────────────── */
  .view-database { animation:fadeUp 0.35s ease; }
  .db-placeholder { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg); padding:60px 40px; text-align:center; }
  .db-icon  { width:72px; height:72px; border-radius:50%; background:var(--blue-dim); border:1px solid rgba(59,130,246,0.2); display:flex; align-items:center; justify-content:center; color:var(--blue); margin:0 auto 20px; }
  .db-title { font-size:18px; font-weight:500; color:var(--text-1); margin-bottom:12px; }
  .db-sub   { font-size:14px; color:var(--text-3); max-width:440px; margin:0 auto; line-height:1.65; }

  /* ── Scanner view wrapper ───────────────────────────────────── */
  .view-scanner { animation:fadeUp 0.35s ease; }

  /* ── Footer ─────────────────────────────────────────────────── */
  .footer { border-top:1px solid var(--border); padding:28px 0 0; margin-top:60px; }
  .footer-inner { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }
  .footer-brand  { display:flex; align-items:center; gap:8px; font-size:14px; color:var(--text-2); }
  .footer-source { font-family:var(--font); font-size:11px; color:var(--text-3); max-width:340px; line-height:1.5; }
  .footer-legal  { font-size:12px; color:var(--text-3); }
  .footer-legal a { color:var(--text-3); text-decoration:underline; text-underline-offset:2px; }

  /* ── Utility ────────────────────────────────────────────────── */
  @keyframes spin { to{ transform:rotate(360deg); } }
  .spinner { animation:spin 1s linear infinite; }
`;
