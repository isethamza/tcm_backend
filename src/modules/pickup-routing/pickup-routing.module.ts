import { Module } from '@nestjs/common';
import { PickupRoutingController } from './pickup-routing.controller';
import { PickupRoutingService } from './pickup-routing.service';

@Module({
  controllers: [PickupRoutingController],
  providers: [PickupRoutingService], // ✅ ADD THIS
  exports: [PickupRoutingService],   // ✅ optional but recommended
})
export class PickupRoutingModule {}