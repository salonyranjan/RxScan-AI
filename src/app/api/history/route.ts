import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const scans = await prisma.prescriptionScan.findMany({
    orderBy: { scannedAt: 'desc' },
  });

  return NextResponse.json({ scans });
}