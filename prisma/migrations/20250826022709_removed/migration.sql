/*
  Warnings:

  - You are about to drop the column `deviceTokenId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Emergency_patientId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "deviceTokenId";
