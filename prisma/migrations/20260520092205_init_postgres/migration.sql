-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT,
    "frequency" TEXT,
    "instructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "taken" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InteractingDrug" (
    "id" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "interactingDrugName" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "InteractingDrug_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescription_scans" (
    "id" TEXT NOT NULL,
    "patientName" TEXT NOT NULL DEFAULT 'Unknown Patient',
    "recordDate" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "medications" JSONB NOT NULL,
    "drugInteractions" JSONB NOT NULL,

    CONSTRAINT "prescription_scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VitalsLog" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "heartRate" INTEGER NOT NULL,
    "systolicBP" INTEGER NOT NULL,
    "diastolicBP" INTEGER NOT NULL,

    CONSTRAINT "VitalsLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_medicationId_time_key" ON "Schedule"("medicationId", "time");

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteractingDrug" ADD CONSTRAINT "InteractingDrug_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VitalsLog" ADD CONSTRAINT "VitalsLog_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "prescription_scans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
