"use client";

import SummaryCard from '@/components/SummaryCard';
import { useState } from 'react';
import UploadButton from '@/components/UploadButton';
import Timeline from '@/components/Timeline';
import Alerts from '@/components/Alerts';
import { FaSpinner, FaSimCard, FaBatteryFull, FaEllipsisH, FaSignal } from 'react-icons/fa';

export default function Dashboard() {
  // Core state declarations
  const [prescriptionList, setPrescriptionList] = useState<Array<{ drugName: string; dosage: string; frequency: string }>>([]);
  const [drugAlerts, setDrugAlerts] = useState<Array<{ medication: string; interactions: Array<{ interactingDrug: string; severity: string; description: string }> }>>([]);
  const [clinicalSource, setClinicalSource] = useState<string>('');
  const [loadingState, setLoadingState] = useState<boolean>(false);

  // Progress analytics calculations
  const totalMedications = prescriptionList.length;
  const distinctCompounds = new Set(prescriptionList.map(i => i.drugName)).size;
  const severitySumJson = drugAlerts.reduce((sum, item) => sum + item.interactions.length, 0);
  const pendingInteractions = severitySumJson;

  // API integration pathway
  const handleImageUpload = async (digitalInput: string) => {
    setLoadingState(true);
    try {
      const endpointResponse = await fetch('/api/analyze-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: digitalInput })
      });
      const payload = await endpointResponse.json();

      if (endpointResponse.ok) {
        setPrescriptionList(payload.parsedMedications ?? []);
        setDrugAlerts(payload.flaggedInteractions ?? []);
        setClinicalSource(payload.verificationContext ?? '');
      }
    } catch (networkError) {
      console.error('Technical failure in consultation sync:', networkError);
    } finally {
      setLoadingState(false);
    }
  };

  // Safe visual state mapping to align with strict SummaryCard variant typing
  const perceptualAlertCount = severitySumJson > 0 ? "critical" : "info";

  return (
    <main className="min-h-screen bg-[#030303] text-white p-4 md:p-10 max-w-[1600px] mx-auto w-full space-y-10 selection:bg-[#00f0ff] selection:text-black">
      
      {/* HEADER HUD CONTAINER */}
      <header className="bg-zinc-950 border-2 border-purple-500/30 rounded-xl shadow-[0_0_15px_rgba(157,78,221,0.15)] p-6 md:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#9d4edd]/5 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-[#00f0ff] rounded-none animate-ping" />
            <span className="text-xs font-mono tracking-widest text-[#00f0ff] uppercase font-bold">SYSTEM STATUS: OPERATIONAL</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mt-1 uppercase font-mono">
            Sync<span className="text-yellow-400">Pharma</span> // CORE_DECK
          </h1>
          <p className="text-zinc-400 text-base md:text-lg mt-1 font-medium max-w-3xl">
            High-contrast medication adherence monitoring with AI-powered pharmaceutical interaction detection.
          </p>
        </div>

        {clinicalSource && (
          <div className="bg-zinc-950 border-2 border-yellow-400/50 px-5 py-3 font-mono text-sm self-start lg:self-auto rounded-lg shadow-[0_0_15px_rgba(251,255,0,0.15)]">
            <span className="text-[10px] text-zinc-500 block uppercase font-black tracking-widest">ACTIVE LOG SOURCE</span>
            <span className="text-yellow-300 font-black text-base">{clinicalSource}</span>
          </div>
        )}
      </header>

      {/* DATA ACQUISITION HUBS */}
      <section className="bg-zinc-950 border-2 border-zinc-800 rounded-xl p-6 md:p-8 space-y-4 backdrop-blur-sm">
        <h2 className="text-xl font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2 font-mono">
          <span className="text-[#00f0ff] font-mono">[01]</span> Scan Prescription Documentation
        </h2>
        <div className="relative">
          <UploadButton onUpload={handleImageUpload} />
          {loadingState && (
            <div className="mt-4 flex items-center justify-center gap-3 text-lg font-mono font-bold text-[#00f0ff] py-4 bg-cyan-950/20 border border-[#00f0ff]/30 rounded-lg animate-pulse">
              <FaSpinner size={24} className="animate-spin text-[#00f0ff]" />
              COMPUTING VECTOR CROSS-REFERENCES...
            </div>
          )}
        </div>
      </section>

      {/* CORE OPERATIONAL DATA MATRICES */}
      <div className="space-y-10 animate-fadeIn">
        
        {/* CORE METRICS GRID */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard
            title="PARSED ITEMS"
            value={totalMedications}
            description="Medication components currently mapped inside active routine configurations."
            variant={totalMedications > 0 ? "primary" : "info"}
          />
          <SummaryCard
            title="UNIQUE COMPONENTS"
            value={distinctCompounds}
            description="Distinct molecular structures checked against internal cross-references."
            variant="info"
          />
          <SummaryCard
            title="CONFLICT ALERTS"
            value={severitySumJson}
            description="Active pharmaceutical interaction warning signatures flagged."
            variant={perceptualAlertCount}
          />
        </section>

        {/* PROCESS RUNTIME SPLIT HUD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* CHRONO SCHEDULE ARRANGEMENT (7 Columns) */}
          <section className="lg:col-span-7 bg-zinc-950 border-2 border-zinc-800 border-t-4 border-t-[#00f0ff] rounded-xl p-6 md:p-8 space-y-6 backdrop-blur-sm">
            <div className="border-b border-zinc-800 pb-4">
              <h3 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3 font-mono">
                <span className="text-yellow-400">📅</span> Daily Item Progression
              </h3>
              <p className="text-zinc-400 text-sm font-medium mt-1">
                Chronological medication scheduling for safe periodic consumption.
              </p>
            </div>
            <Timeline prescription={prescriptionList} />
          </section>

          {/* RISK SHIELD WARNING MODULE (5 Columns) */}
          <section className="lg:col-span-5 space-y-8">
            {pendingInteractions > 0 ? (
              <div className="bg-zinc-950 border-2 border-red-500/40 rounded-xl p-6 md:p-8 space-y-6 shadow-[0_0_20px_rgba(220,38,38,0.15)] animate-alert-pulse">
                <div className="border-b border-zinc-800 pb-4">
                  <h3 className="text-2xl font-black uppercase tracking-tight text-red-500 flex items-center gap-3 font-mono">
                    <span>🛑</span> Flagged Interaction Subspace
                  </h3>
                  <p className="text-zinc-400 text-sm font-medium mt-1">
                    Critical pharmaceutical interaction warnings identified within relational data matrices.
                  </p>
                </div>
                <Alerts interactions={drugAlerts} />
              </div>
            ) : (
              <div className="bg-zinc-950 border-2 border-emerald-500/30 rounded-xl p-8 text-center py-16 shadow-[0_0_20px_rgba(34,211,153,0.1)]">
                <span className="text-6xl block mb-4">🛡️</span>
                <h3 className="text-2xl font-black text-emerald-400 uppercase tracking-wide font-mono">
                  PHARMACEUTICAL MATRIX SECURE
                </h3>
                <p className="text-zinc-400 text-sm mt-2 max-w-sm mx-auto font-medium leading-relaxed">
                  All parsed items compile safely. No structural incompatibility signals or compound overlapping collisions detected.
                </p>
              </div>
            )}

            {/* ENVIRONMENT METADATA DRAWER */}
            <div className="bg-zinc-950 border-2 border-zinc-800 rounded-xl p-6 space-y-5 backdrop-blur-sm">
              <h4 className="text-xs font-mono font-black tracking-widest text-zinc-500 uppercase">
                SYSTEM DIAGNOSTIC STREAM
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* INTERACTION MATRIX CARD */}
                <div className="bg-black/40 border border-zinc-800/80 p-4 space-y-2 rounded-lg">
                  <h5 className="text-xs font-mono text-zinc-400 uppercase font-bold tracking-wider">
                    AVAILABILITY MATRIX
                  </h5>
                  <p className="text-xs font-medium text-zinc-300">Operational readiness confirmed.</p>
                  <FaSimCard className="text-[#00f0ff] animate-pulse mt-2" size={18} />
                </div>

                {/* DEVICE TELEMETRY MATRIX */}
                <div className="bg-black/40 border border-zinc-800/80 p-4 space-y-2 rounded-lg">
                  <h5 className="text-xs font-mono text-zinc-400 uppercase font-bold tracking-wider">
                    HARDWARE TELEMETRY
                  </h5>
                  <div className="space-y-2 text-[11px] font-mono text-zinc-400">
                    <div className="flex justify-between items-center">
                      <span>UPTIME:</span>
                      <FaBatteryFull className="text-[#00ff66]" size={15} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>LATENCY:</span>
                      <FaEllipsisH className="text-[#9d4edd] animate-pulse" size={13} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>SIGNAL:</span>
                      <FaSignal className="text-[#00f0ff]" size={13} />
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </section>
        </div>
      </div>
    </main>
  );
}