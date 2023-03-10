/*
  Warnings:

  - Added the required column `sourceId` to the `Measurement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Measurement" ADD COLUMN     "sourceId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
