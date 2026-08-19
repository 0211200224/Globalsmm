-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'WALLET_DEPOSIT';

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'PENDING_ADMIN';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "externalOrderId" TEXT,
ADD COLUMN     "providerId" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PENDING_ADMIN';

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "costPer1000" DECIMAL(10,4),
ADD COLUMN     "externalServiceId" TEXT,
ADD COLUMN     "providerId" TEXT;

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "apiUrl" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "balance" DECIMAL(12,2),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
