ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "PreOrder" ADD COLUMN "userId" TEXT;
ALTER TABLE "PreOrder" ADD CONSTRAINT "PreOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "PreOrder_userId_createdAt_idx" ON "PreOrder"("userId", "createdAt");

CREATE TABLE "Address" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "label" TEXT NOT NULL DEFAULT 'Home',
  "fullName" TEXT NOT NULL, "phone" TEXT, "line1" TEXT NOT NULL, "line2" TEXT,
  "city" TEXT NOT NULL, "postalCode" TEXT, "country" TEXT NOT NULL DEFAULT 'Israel',
  "isDefault" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "Address_userId_idx" ON "Address"("userId");

CREATE TABLE "WishlistItem" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "productId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE UNIQUE INDEX "WishlistItem_userId_productId_key" ON "WishlistItem"("userId", "productId");
CREATE INDEX "WishlistItem_userId_idx" ON "WishlistItem"("userId");

CREATE TABLE "PasswordResetToken" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "tokenHash" TEXT NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE INDEX "PasswordResetToken_userId_expiresAt_idx" ON "PasswordResetToken"("userId", "expiresAt");

CREATE TABLE "EmailNotification" (
  "id" TEXT NOT NULL, "eventKey" TEXT NOT NULL, "recipient" TEXT NOT NULL, "template" TEXT NOT NULL,
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "EmailNotification_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "EmailNotification_eventKey_key" ON "EmailNotification"("eventKey");
CREATE INDEX "EmailNotification_recipient_sentAt_idx" ON "EmailNotification"("recipient", "sentAt");
