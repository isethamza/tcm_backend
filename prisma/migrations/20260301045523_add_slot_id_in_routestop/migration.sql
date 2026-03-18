-- AlterTable
ALTER TABLE "route_stops" ADD COLUMN     "slotId" TEXT;

-- AddForeignKey
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "scheduling_slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;
