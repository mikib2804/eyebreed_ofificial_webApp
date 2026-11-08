CREATE TABLE "legacy_parameter_ordinal_position_raw" (
  "id" TEXT NOT NULL,
  "sourceName" TEXT NOT NULL,
  "sourceSchema" TEXT NOT NULL,
  "sourceTable" TEXT NOT NULL,
  "sourceKey" TEXT NOT NULL,
  "sourceHash" TEXT NOT NULL,
  "normalizedEmail" TEXT,
  "rawData" JSONB NOT NULL,
  "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "legacy_parameter_ordinal_position_raw_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "legacy_parameter_ordinal_position_source_key" ON "legacy_parameter_ordinal_position_raw"("sourceName", "sourceSchema", "sourceTable", "sourceKey");
CREATE INDEX "legacy_parameter_ordinal_position_raw_sourceHash_idx" ON "legacy_parameter_ordinal_position_raw"("sourceHash");
CREATE INDEX "legacy_parameter_ordinal_position_raw_normalizedEmail_idx" ON "legacy_parameter_ordinal_position_raw"("normalizedEmail");
