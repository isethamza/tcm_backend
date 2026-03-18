-- AlterEnum
ALTER TYPE "ParcelStatus" ADD VALUE 'DELIVRED';

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "deliveryGeoStatus" TEXT,
ADD COLUMN     "deliveryLat" DOUBLE PRECISION,
ADD COLUMN     "deliveryLng" DOUBLE PRECISION,
ADD COLUMN     "pickupGeoStatus" TEXT,
ALTER COLUMN "pickupLat" DROP NOT NULL,
ALTER COLUMN "pickupLng" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "bookings_pickupGeoStatus_idx" ON "bookings"("pickupGeoStatus");

-- CreateIndex
CREATE INDEX "bookings_deliveryGeoStatus_idx" ON "bookings"("deliveryGeoStatus");
