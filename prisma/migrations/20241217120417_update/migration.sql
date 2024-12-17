/*
  Warnings:

  - A unique constraint covering the columns `[customerId,productId]` on the table `recent_views` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "recent_views_customerId_productId_key" ON "recent_views"("customerId", "productId");
