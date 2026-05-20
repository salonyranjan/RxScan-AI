import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic'; // Ensures Vercel doesn't heavily cache this route if data updates frequently

export async function GET(request: NextRequest) {
  try {
    // 🚀 Fetch the most recent 50 scans and attach their latest biometric log preview
    const scans = await prisma.prescriptionScan.findMany({
      orderBy: { scannedAt: 'desc' },
      take: 50, // Prevents massive payload limits as the database grows
      include: {
        vitalsLogs: {
          orderBy: { recordedAt: 'desc' },
          take: 1, // Only pull the most recent vitals log to use as a dashboard preview card
        },
      },
    });

    return NextResponse.json(
      { 
        count: scans.length,
        scans 
      }, 
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Critical error fetching prescription history:", error);
    
    return NextResponse.json(
      { 
        error: 'Database read failure', 
        message: 'Could not retrieve prescription scan history from the cloud cluster.' 
      }, 
      { status: 500 }
    );
  }
}
