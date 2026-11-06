CREATE TABLE "NewsletterSubscriber" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "locale" TEXT NOT NULL DEFAULT 'he',
  "source" TEXT NOT NULL DEFAULT 'footer',
  "consentAt" TIMESTAMP(3) NOT NULL,
  "ipHash" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");
CREATE INDEX "NewsletterSubscriber_ipHash_createdAt_idx" ON "NewsletterSubscriber"("ipHash", "createdAt");
CREATE INDEX "NewsletterSubscriber_active_createdAt_idx" ON "NewsletterSubscriber"("active", "createdAt");
