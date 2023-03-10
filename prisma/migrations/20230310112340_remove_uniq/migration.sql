/*
  Warnings:

  - You are about to drop the column `name` on the `Source` table. All the data in the column will be lost.
  - Added the required column `value` to the `Source` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Event_title_key";

-- DropIndex
DROP INDEX "Project_name_key";

-- AlterTable
ALTER TABLE "Source" DROP COLUMN "name",
ADD COLUMN     "value" TEXT NOT NULL;
