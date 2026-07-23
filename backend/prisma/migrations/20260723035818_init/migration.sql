-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scan" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "status" "ScanStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "passCount" INTEGER,
    "violationCount" INTEGER,

    CONSTRAINT "Scan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Violation" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "wcagCriteria" TEXT[],
    "description" TEXT NOT NULL,
    "helpUrl" TEXT NOT NULL,
    "htmlSnippet" TEXT NOT NULL,
    "targetSelector" TEXT NOT NULL,

    CONSTRAINT "Violation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Scan_siteId_idx" ON "Scan"("siteId");

-- CreateIndex
CREATE INDEX "Violation_scanId_idx" ON "Violation"("scanId");

-- AddForeignKey
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Violation" ADD CONSTRAINT "Violation_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
