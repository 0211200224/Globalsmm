/*
  Warnings:

  - Added the required column `serviceType` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "badge" TEXT,
ADD COLUMN     "icon" TEXT NOT NULL DEFAULT 'bolt',
ADD COLUMN     "serviceType" TEXT NOT NULL,
ADD COLUMN     "speedLabel" TEXT NOT NULL DEFAULT 'Standard';

-- AlterTable
ALTER TABLE "ServiceCategory" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Service_serviceType_idx" ON "Service"("serviceType");
