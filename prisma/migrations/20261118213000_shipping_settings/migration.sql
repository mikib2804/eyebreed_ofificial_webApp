ALTER TABLE "StoreSettings"
  ADD COLUMN "shippingEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "shippingPriceIls" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "shippingPriceUsd" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "shippingPriceEur" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "freeShippingEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "freeShippingThresholdIls" DECIMAL(10,2),
  ADD COLUMN "freeShippingThresholdUsd" DECIMAL(10,2),
  ADD COLUMN "freeShippingThresholdEur" DECIMAL(10,2);
