/*
  Warnings:

  - You are about to drop the column `questionId` on the `tests` table. All the data in the column will be lost.
  - You are about to drop the column `questionYear` on the `tests` table. All the data in the column will be lost.
  - Added the required column `totalQuestions` to the `tests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tests" DROP COLUMN "questionId",
DROP COLUMN "questionYear",
ADD COLUMN     "totalQuestions" INTEGER NOT NULL;
