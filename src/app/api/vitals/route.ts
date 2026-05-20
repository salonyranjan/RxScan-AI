import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// 🚀 CRITICAL: Prevents Vercel's Edge Network from aggressively caching real-time patient biometrics!
export const dynamic = 'force-dynamic';

/**
 * POST /api/vitals
 * Process inbound daily metric entries.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { scanId, heartRate, systolicBP, diastolicBP } = payload;

    if (!scanId) {
      return NextResponse.json({ error: "scanId is required" }, { status: 400 });
    }

    const hr = Number(heartRate);
    const sys = Number(systolicBP);
    const dia = Number(diastolicBP);

    if ([hr, sys, dia].some((n) => Number.isNaN(n) || n < 0)) {
      return NextResponse.json({ error: "heartRate, systolicBP and diastolicBP must be valid non‑negative numbers" }, { status: 400 });
    }

    // Verify parent existence to shield against foreign key anomalies
    const parent = await prisma.prescriptionScan.findUnique({ where: { id: scanId } });
    if (!parent) {
      return NextResponse.json({ error: "PrescriptionScan target record reference not found" }, { status: 404 });
    }

    // 🚀 FIXED: Removed the proxy hack. Uses the native, fully typed Prisma client!
    const created = await prisma.vitalsLog.create({
      data: {
        scanId,
        heartRate: hr,
        systolicBP: sys,
        diastolicBP: dia,
      },
    });

    return NextResponse.json({ message: "Vitals logged successfully", success: true, log: created }, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/vitals execution error:", e);
    return NextResponse.json({ error: "Internal Server Error", details: e.message }, { status: 500 });
  }
}

/**
 * GET /api/vitals?scanId=...
 * Streams a completely flat data vector structure directly to your Recharts component.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scanId = searchParams.get("scanId");
    
    if (!scanId) {
      return NextResponse.json({ error: "scanId query parameter is required" }, { status: 400 });
    }

    // 🚀 FIXED: Uses native Prisma client with guaranteed types
    const logs = await prisma.vitalsLog.findMany({
      where: { scanId },
      orderBy: { recordedAt: "asc" },
    });

    // Cleanly map the payload so Recharts can ingest it flawlessly
    const formatted = logs.map((log) => ({
      id: log.id,
      recordedAt: log.recordedAt.toISOString(),
      heartRate: log.heartRate,
      systolicBP: log.systolicBP,
      diastolicBP: log.diastolicBP,
    }));

    return NextResponse.json(formatted, { status: 200 });
  } catch (e: any) {
    console.error("GET /api/vitals error:", e);
    return NextResponse.json({ error: "Internal Server Error", details: e.message }, { status: 500 });
  }
}
