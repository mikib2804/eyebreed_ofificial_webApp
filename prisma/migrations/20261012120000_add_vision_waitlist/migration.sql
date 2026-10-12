CREATE TABLE "VisionWaitlistEntry" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisionWaitlistEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VisionWaitlistEntry_email_key" ON "VisionWaitlistEntry"("email");
