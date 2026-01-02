/*
  Warnings:

  - You are about to drop the `QuestionAnswer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "QuestionAnswer" DROP CONSTRAINT "QuestionAnswer_authorId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionAnswer" DROP CONSTRAINT "QuestionAnswer_testId_fkey";

-- DropTable
DROP TABLE "QuestionAnswer";

-- CreateTable
CREATE TABLE "question_answers" (
    "id" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "testId" INTEGER,
    "questionId" TEXT NOT NULL,
    "questionYear" INTEGER,
    "selectedOption" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "question_answers_authorId_questionId_testId_key" ON "question_answers"("authorId", "questionId", "testId");

-- AddForeignKey
ALTER TABLE "question_answers" ADD CONSTRAINT "question_answers_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_answers" ADD CONSTRAINT "question_answers_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
