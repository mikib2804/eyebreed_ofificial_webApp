ALTER TABLE "User"
ADD COLUMN "acceptMarketingEmails" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "emailLocale" TEXT NOT NULL DEFAULT 'he';

ALTER TABLE "EmailNotification"
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'SENT',
ADD COLUMN "error" TEXT,
ADD COLUMN "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "sentAt" DROP NOT NULL,
ALTER COLUMN "sentAt" DROP DEFAULT;

CREATE INDEX "EmailNotification_status_attemptedAt_idx"
ON "EmailNotification"("status", "attemptedAt");

DROP INDEX IF EXISTS "EmailNotification_recipient_sentAt_idx";
CREATE INDEX "EmailNotification_recipient_attemptedAt_idx"
ON "EmailNotification"("recipient", "attemptedAt");
