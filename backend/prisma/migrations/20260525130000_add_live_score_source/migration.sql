ALTER TABLE "Match" ADD COLUMN "externalProvider" TEXT;
ALTER TABLE "Match" ADD COLUMN "externalFixtureId" TEXT;
ALTER TABLE "Match" ADD COLUMN "lastSyncedAt" DATETIME;

CREATE UNIQUE INDEX "Match_externalProvider_externalFixtureId_key" ON "Match"("externalProvider", "externalFixtureId");
