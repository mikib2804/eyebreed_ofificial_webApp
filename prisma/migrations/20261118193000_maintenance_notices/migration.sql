CREATE TABLE "MaintenanceNotice" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "subtitle" TEXT,
  "message" TEXT NOT NULL,
  "duration" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MaintenanceNotice_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MaintenanceNotice_valid_dates" CHECK ("endsAt" > "startsAt")
);

CREATE INDEX "MaintenanceNotice_active_startsAt_idx" ON "MaintenanceNotice"("active", "startsAt");
CREATE INDEX "MaintenanceNotice_createdAt_idx" ON "MaintenanceNotice"("createdAt");
CREATE UNIQUE INDEX "MaintenanceNotice_single_active_key" ON "MaintenanceNotice" (("active")) WHERE "active" = true;
