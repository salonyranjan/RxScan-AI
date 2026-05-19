-- CreateTable
CREATE TABLE "prescription_scans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientName" TEXT NOT NULL DEFAULT 'Unknown Patient',
    "recordDate" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "scannedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "medications" JSONB NOT NULL,
    "drugInteractions" JSONB NOT NULL
);
