-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "qualityScore" DECIMAL(3,1),
ADD COLUMN     "refillDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "retentionPercent" INTEGER;

-- CreateTable
CREATE TABLE "RefillRequest" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefillRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefillRequest_orderId_key" ON "RefillRequest"("orderId");

-- AddForeignKey
ALTER TABLE "RefillRequest" ADD CONSTRAINT "RefillRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
