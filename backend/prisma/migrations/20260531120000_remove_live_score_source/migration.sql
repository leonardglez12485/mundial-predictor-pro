DROP INDEX IF EXISTS "Match_externalProvider_externalFixtureId_key";

ALTER TABLE "Match" DROP COLUMN "externalProvider";
ALTER TABLE "Match" DROP COLUMN "externalFixtureId";
ALTER TABLE "Match" DROP COLUMN "lastSyncedAt";
