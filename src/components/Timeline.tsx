"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import clsx from 'clsx';

export default function Timeline({ prescription }: { prescription: Array<{ drugName: string; dosage: string; frequency: string }> }) {
  // 1. Core State tracking to solve the hydration time mismatch error permanently
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Mock schedule data mapped from incoming analyzed structures
  const mockSchedule = [
    { drug: prescription[0]?.drugName || 'Lisinopril', time: '08:00 AM', taken: true },
    { drug: prescription[1]?.drugName || 'Metformin', time: '09:00 AM', taken: false },
    { drug: prescription[2]?.drugName || 'Atorvastatin', time: '09:00 PM', taken: false }
  ];

  // 2. Structural Loading Skeleton while server mounts to safely shield the live clock
  if (!hasMounted) {
    return (
      <div className="p-4 font-mono text-xs text-zinc-500 animate-pulse tracking-widest">
        SYNCHRONIZING REVOLUTIONARY TIME ARRAYS...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* CHRONO FLEX ARRAY GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {mockSchedule.map((med, index) => (
          <div 
            key={index} 
            className={clsx(
              "border-2 p-4 flex flex-col justify-between space-y-3 relative overflow-hidden backdrop-blur-sm transition-all duration-300",
              med.taken 
                ? "bg-zinc-950/40 border-zinc-800 text-zinc-400" 
                : "bg-zinc-950 border-yellow-400/50 text-white shadow-[0_0_15px_rgba(251,255,0,0.05)]"
            )}
          >
            {/* Edge state micro-strip accent */}
            <div className={clsx(
              "absolute top-0 left-0 w-1 h-full opacity-60",
              med.taken ? "bg-zinc-700" : "bg-yellow-400"
            )} />

            <div>
              <time className="text-xs font-mono tracking-wider font-bold block text-zinc-500 uppercase">
                SCHEDULED TIME: {med.time}
              </time>
              <span className="text-base font-black tracking-tight block mt-1 font-mono uppercase">
                {med.drug}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
              <span className={clsx(
                "text-[10px] font-mono font-black tracking-widest uppercase px-2 py-0.5 rounded-sm",
                med.taken ? "bg-zinc-800 text-zinc-500" : "bg-yellow-950 text-yellow-400"
              )}>
                {med.taken ? "COMPLETED" : "PENDING"}
              </span>

              {!med.taken && (
                <span className="text-[11px] text-yellow-400 font-mono font-bold animate-pulse flex items-center gap-1">
                  ⚠️ MISSED DOSE
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* REAL-TIME ENGINE STATUS TELEMETRY */}
      <div className="bg-black/40 border border-zinc-900 p-4 font-mono text-xs text-zinc-500 flex items-center justify-between rounded-lg">
        <span className="tracking-widest uppercase font-black text-[10px]">CHRONO_STREAM_STATUS</span>
        <span className="text-[#00f0ff] font-bold animate-pulse">
          NEXT DOSES IN: {format(new Date(), 'mm')} MINUTES
        </span>
      </div>

    </div>
  );
}