/*
  Warnings:

  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `sessionToken` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[session_token]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_sessionToken_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "passwordHash",
DROP COLUMN "sessionToken",
ADD COLUMN     "password_hash" TEXT,
ADD COLUMN     "session_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_session_token_key" ON "User"("session_token");
