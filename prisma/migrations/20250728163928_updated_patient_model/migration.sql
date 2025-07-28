/*
  Warnings:

  - You are about to drop the column `medicId` on the `DeviceToken` table. All the data in the column will be lost.
  - You are about to drop the column `patientId` on the `DeviceToken` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Medic` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Medic` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `Medic` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Medic` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Medic` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Medic` table. All the data in the column will be lost.
  - You are about to drop the column `reference` on the `Medic` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Medic` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `email_verified` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `logitude` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `phone_number` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `reference` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the `MedicalProfile` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Medic` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Medic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('Patient', 'MEDICS', 'ADMIN');

-- DropForeignKey
ALTER TABLE "DeviceToken" DROP CONSTRAINT "DeviceToken_medicId_fkey";

-- DropForeignKey
ALTER TABLE "DeviceToken" DROP CONSTRAINT "DeviceToken_patientId_fkey";

-- DropForeignKey
ALTER TABLE "MedicalProfile" DROP CONSTRAINT "MedicalProfile_patientId_fkey";

-- DropIndex
DROP INDEX "Medic_email_key";

-- DropIndex
DROP INDEX "Medic_reference_key";

-- DropIndex
DROP INDEX "Patient_email_key";

-- DropIndex
DROP INDEX "Patient_reference_key";

-- AlterTable
ALTER TABLE "DeviceToken" DROP COLUMN "medicId",
DROP COLUMN "patientId",
ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "Medic" DROP COLUMN "createdAt",
DROP COLUMN "email",
DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "password",
DROP COLUMN "phone",
DROP COLUMN "reference",
DROP COLUMN "updatedAt",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "address",
DROP COLUMN "createdAt",
DROP COLUMN "email",
DROP COLUMN "email_verified",
DROP COLUMN "latitude",
DROP COLUMN "logitude",
DROP COLUMN "password",
DROP COLUMN "phone_number",
DROP COLUMN "reference",
DROP COLUMN "state",
DROP COLUMN "updatedAt",
ADD COLUMN     "allergies" TEXT[],
ADD COLUMN     "bloodType" TEXT,
ADD COLUMN     "conditions" TEXT[],
ADD COLUMN     "userId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "MedicalProfile";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_number" TEXT,
    "address" TEXT,
    "state" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "userType" "UserType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_reference_key" ON "User"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Medic_userId_key" ON "Medic"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_userId_key" ON "Patient"("userId");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medic" ADD CONSTRAINT "Medic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceToken" ADD CONSTRAINT "DeviceToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
