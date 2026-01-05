-- CreateTable
CREATE TABLE "UserStatistics" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "totalSimulados" INTEGER NOT NULL DEFAULT 0,
    "questionsDone" INTEGER NOT NULL DEFAULT 0,
    "questionsRight" INTEGER NOT NULL DEFAULT 0,
    "questionsWrong" INTEGER NOT NULL DEFAULT 0,
    "scoreNatureza" INTEGER NOT NULL DEFAULT 0,
    "scoreHumanas" INTEGER NOT NULL DEFAULT 0,
    "scoreLinguagens" INTEGER NOT NULL DEFAULT 0,
    "scoreMatematica" INTEGER NOT NULL DEFAULT 0,
    "totalNatureza" INTEGER NOT NULL DEFAULT 0,
    "totalHumanas" INTEGER NOT NULL DEFAULT 0,
    "totalLinguagens" INTEGER NOT NULL DEFAULT 0,
    "totalMatematica" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserStatistics_userId_key" ON "UserStatistics"("userId");

-- AddForeignKey
ALTER TABLE "UserStatistics" ADD CONSTRAINT "UserStatistics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
