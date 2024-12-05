-- AlterTable
ALTER TABLE "vendors" ADD COLUMN     "isOnboarded" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "name" DROP NOT NULL;
