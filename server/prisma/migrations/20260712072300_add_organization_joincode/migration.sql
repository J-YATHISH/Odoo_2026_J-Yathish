-- DropIndex
DROP INDEX "Organization_name_key";

-- AlterTable
ALTER TABLE "AssetCategory" DROP COLUMN "baseCarbonFootprintKg",
DROP COLUMN "expectedLifespanMonths",
DROP COLUMN "powerDrawWatts";

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "joinCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_joinCode_key" ON "Organization"("joinCode");
