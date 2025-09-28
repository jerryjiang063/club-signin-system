-- AlterTable
ALTER TABLE "Plant" ADD COLUMN "careNotes" TEXT;
ALTER TABLE "Plant" ADD COLUMN "waterAmount" TEXT;
ALTER TABLE "Plant" ADD COLUMN "waterSchedule" TEXT;

-- AlterTable
ALTER TABLE "PlantCare" ADD COLUMN "notes" TEXT;
ALTER TABLE "PlantCare" ADD COLUMN "taskType" TEXT;
