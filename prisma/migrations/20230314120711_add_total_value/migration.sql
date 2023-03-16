/*
  Warnings:

  - Added the required column `totalValue` to the `Measurement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Measurement" ADD COLUMN     "totalValue" DOUBLE PRECISION NOT NULL;
