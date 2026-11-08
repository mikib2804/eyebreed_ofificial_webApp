ALTER TABLE "VisionWaitlistEntry"
  ADD COLUMN "consentScope" TEXT NOT NULL DEFAULT 'PREORDER_UPDATES',
  ADD COLUMN "source" TEXT NOT NULL DEFAULT 'vision-page',
  ADD COLUMN "lastEmailedAt" TIMESTAMP(3);

CREATE INDEX "VisionWaitlistEntry_source_createdAt_idx" ON "VisionWaitlistEntry"("source", "createdAt");
