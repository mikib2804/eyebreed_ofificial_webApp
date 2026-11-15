CREATE TABLE "PreorderWaitlistEntry" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastEmailedAt" TIMESTAMP(3),
  CONSTRAINT "PreorderWaitlistEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PreorderWaitlistEntry_normalized_email_key"
ON "PreorderWaitlistEntry" (lower(btrim("email")));

CREATE INDEX "PreorderWaitlistEntry_createdAt_idx"
ON "PreorderWaitlistEntry"("createdAt");
