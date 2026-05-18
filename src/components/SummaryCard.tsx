"use client";

import clsx from "clsx";

interface SummaryCardProps {
  title: string;
  value: string | number;
  description: string;
  variant?: "primary" | "info" | "caution" | "critical";
}

/*
 * Custom neon-lit summary card component for medication monitoring dashboard
 *
 * @param SummaryCardProps Props interface defining required and optional card properties
 */
export default function SummaryCard({
  title,
  value,
  description,
  variant = "info",
}: SummaryCardProps) {
  // Neon border configurations
  const neonConfig = {
    primary: {
      border: "cyan-400/80",
      text: "cyan-300",
      glow: "shadow-[0_0_15px_rgba(0,255,255,0.5)]"
    },
    info: {
      border: "emerald-500/70",
      text: "emerald-100",
      glow: "shadow-[0_0_15px_rgba(34,211,153,0.4)]"
    },
    caution: {
      border: "yellow-400/70",
      text: "amber-100",
      glow: "shadow-[0_0_15px_rgba(251,255,0,0.4)]"
    },
    critical: {
      border: "red-400/70",
      text: "red-100",
      glow: "shadow-[0_0_15px_rgba(220,38,38,0.5)]"
    }
  };

  const config = neonConfig[variant] || neonConfig.info;

  return (
    <div
      className={clsx(
        "bg-zinc-950 rounded-xl border-4 p-6 space-y-3",
        {
          "border-2": true,
          [config.border]: true,
          [config.glow]: true,
          "shadow-[0_0_20px_2px_rgba(0,255,255,0.2)]": true,
          "backdrop-blur-sm": true
        }
      )}
    >
      <h2 className={clsx(
        "font-medium uppercase tracking-tight text-[0.05em] md:text-base text-zinc-400",
        {
          "text-yellow-400": variant === "primary",
          "text-emerald-400": variant === "info",
          "text-amber-300": variant === "caution",
          "text-red-300": variant === "critical"
        }
      )}> {title} </h2>

      <div className={clsx(
        "text-4xl font-bold tracking-tight text-white md:text-5xl",
        {
          "text-cyan-300": variant === "primary",
          "text-emerald-400": variant === "info",
          "text-amber-300": variant === "caution",
          "text-red-400": variant === "critical"
        }
      )}> {value} </div>

      <p className={clsx(
        "text-sm font-medium text-zinc-400 tracking-wide",
        {
          "text-zinc-400": true,
          "text-emerald-400": variant === "info",
          "text-amber-300": variant === "caution",
          "text-red-300": variant === "critical"
        }
      )}> {description} </p>
    </div>
  );
}