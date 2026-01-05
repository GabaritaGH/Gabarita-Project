/*
  Warnings:

  - Made the column `area` on table `tests` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "tests" ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
ALTER COLUMN "area" SET NOT NULL,
ALTER COLUMN "title" DROP NOT NULL;
