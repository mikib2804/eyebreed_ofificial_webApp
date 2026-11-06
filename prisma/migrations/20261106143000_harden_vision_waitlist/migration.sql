ALTER TABLE "VisionWaitlistEntry"
  ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'he',
  ADD COLUMN "consentAt" TIMESTAMP(3),
  ADD COLUMN "ipHash" TEXT,
  ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "VisionWaitlistEntry"
SET "consentAt" = "createdAt", "ipHash" = 'legacy'
WHERE "consentAt" IS NULL OR "ipHash" IS NULL;

ALTER TABLE "VisionWaitlistEntry"
  ALTER COLUMN "consentAt" SET NOT NULL,
  ALTER COLUMN "ipHash" SET NOT NULL;

CREATE INDEX "VisionWaitlistEntry_ipHash_createdAt_idx"
  ON "VisionWaitlistEntry"("ipHash", "createdAt");
