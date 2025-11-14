/*
  Warnings:

  - You are about to drop the column `password_hash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `session_token` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_session_token_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password_hash",
DROP COLUMN "session_token";
