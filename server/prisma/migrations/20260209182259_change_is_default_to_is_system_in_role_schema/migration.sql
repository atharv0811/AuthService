/*
  Warnings:

  - You are about to drop the column `is_default` on the `Role` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Role" DROP COLUMN "is_default",
ADD COLUMN     "is_system" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "description" DROP NOT NULL;
