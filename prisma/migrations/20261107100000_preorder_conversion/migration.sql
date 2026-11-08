ALTER TABLE "PreOrder" ADD COLUMN "convertedOrderId" TEXT;
CREATE UNIQUE INDEX "PreOrder_convertedOrderId_key" ON "PreOrder"("convertedOrderId");
ALTER TABLE "PreOrder" ADD CONSTRAINT "PreOrder_convertedOrderId_fkey" FOREIGN KEY ("convertedOrderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
