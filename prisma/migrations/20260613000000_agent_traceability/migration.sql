ALTER TABLE "AgriculturalAgent"
ADD COLUMN "supplier" TEXT,
ADD COLUMN "shipmentNumber" TEXT,
ADD COLUMN "expirationDate" TIMESTAMP(3);

CREATE INDEX "AgriculturalAgent_supplier_idx" ON "AgriculturalAgent"("supplier");
CREATE INDEX "AgriculturalAgent_expirationDate_idx" ON "AgriculturalAgent"("expirationDate");
