import { Module } from '@nestjs/common';
import { PickupSchedulingService } from './pickup-scheduling.service';
import { PickupSchedulingController } from './pickup-scheduling.controller';
import { PrismaService } from '../../prisma/prisma.service';

import { PickupRoutingModule } from '../pickup-routing/pickup-routing.module';
import { AuditModule } from '../audit/audit.module';
import { BookingMailModule } from '../bookings/booking-mail.module';

@Module({
  imports: [
    PickupRoutingModule,
    AuditModule,
    BookingMailModule, // ✅ MUST be here
  ],
  controllers: [PickupSchedulingController],
  providers: [PickupSchedulingService, PrismaService],
})
export class PickupSchedulingModule {}