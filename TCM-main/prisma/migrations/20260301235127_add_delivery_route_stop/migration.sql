-- CreateTable
CREATE TABLE "DeliveryRouteStop" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "sequence" INTEGER NOT NULL,
    "eta" TIMESTAMP(3),
    "destinationType" "DeliveryOption" NOT NULL,
    "hubId" TEXT,
    "tripStopId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryRouteStop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryRouteStop_bookingId_key" ON "DeliveryRouteStop"("bookingId");

-- CreateIndex
CREATE INDEX "DeliveryRouteStop_tripId_sequence_idx" ON "DeliveryRouteStop"("tripId", "sequence");

-- CreateIndex
CREATE INDEX "DeliveryRouteStop_hubId_idx" ON "DeliveryRouteStop"("hubId");

-- CreateIndex
CREATE INDEX "DeliveryRouteStop_tripStopId_idx" ON "DeliveryRouteStop"("tripStopId");

-- AddForeignKey
ALTER TABLE "DeliveryRouteStop" ADD CONSTRAINT "DeliveryRouteStop_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryRouteStop" ADD CONSTRAINT "DeliveryRouteStop_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryRouteStop" ADD CONSTRAINT "DeliveryRouteStop_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "hubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryRouteStop" ADD CONSTRAINT "DeliveryRouteStop_tripStopId_fkey" FOREIGN KEY ("tripStopId") REFERENCES "trip_stops"("id") ON DELETE SET NULL ON UPDATE CASCADE;
