/*
  Warnings:

  - Added the required column `questionId` to the `tests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionYear` to the `tests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tests" ADD COLUMN     "questionId" TEXT NOT NULL,
ADD COLUMN     "questionYear" INTEGER NOT NULL;
