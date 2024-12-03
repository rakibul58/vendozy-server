/*
  Warnings:

  - You are about to drop the column `isDelete` on the `categories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "categories" DROP COLUMN "isDelete",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT true;
