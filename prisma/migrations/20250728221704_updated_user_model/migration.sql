/*
  Warnings:

  - The values [Patient] on the enum `UserType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserType_new" AS ENUM ('PATIENT', 'MEDICS', 'ADMIN');
ALTER TABLE "User" ALTER COLUMN "userType" TYPE "UserType_new" USING ("userType"::text::"UserType_new");
ALTER TYPE "UserType" RENAME TO "UserType_old";
ALTER TYPE "UserType_new" RENAME TO "UserType";
DROP TYPE "UserType_old";
COMMIT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_verified" DROP NOT NULL,
ALTER COLUMN "latitude" DROP NOT NULL,
ALTER COLUMN "longitude" DROP NOT NULL;
