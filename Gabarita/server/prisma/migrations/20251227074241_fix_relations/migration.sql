/*
  Warnings:

  - The primary key for the `QuestionAnswer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[authorId,questionId,testId]` on the table `QuestionAnswer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `authorId` to the `QuestionAnswer` table without a default value. This is not possible if the table is not empty.
  - Made the column `questionYear` on table `QuestionAnswer` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "QuestionAnswer" DROP CONSTRAINT "QuestionAnswer_testId_fkey";

-- DropIndex
DROP INDEX "QuestionAnswer_testId_questionId_key";

-- AlterTable
ALTER TABLE "QuestionAnswer" DROP CONSTRAINT "QuestionAnswer_pkey",
ADD COLUMN     "authorId" INTEGER NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "testId" DROP NOT NULL,
ALTER COLUMN "questionYear" SET NOT NULL,
ALTER COLUMN "selectedOption" DROP NOT NULL,
ADD CONSTRAINT "QuestionAnswer_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "QuestionAnswer_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "QuestionAnswer_authorId_questionId_testId_key" ON "QuestionAnswer"("authorId", "questionId", "testId");

-- AddForeignKey
ALTER TABLE "QuestionAnswer" ADD CONSTRAINT "QuestionAnswer_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionAnswer" ADD CONSTRAINT "QuestionAnswer_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
