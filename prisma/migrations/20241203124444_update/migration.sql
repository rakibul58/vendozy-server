/*
  Warnings:

  - Made the column `address` on table `customers` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "customers" ALTER COLUMN "address" SET NOT NULL;

-- AlterTable
ALTER TABLE "vendors" ALTER COLUMN "logo" DROP NOT NULL;
