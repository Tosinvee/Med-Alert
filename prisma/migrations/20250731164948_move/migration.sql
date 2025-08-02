/*
  Warnings:

  - You are about to drop the column `deviceTokenId` on the `Patient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "deviceTokenId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deviceTokenId" TEXT;
