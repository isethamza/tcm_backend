import { Module } from '@nestjs/common';
import { DeliveryRoutingService } from './delivery-routing.service';
import { DeliveryRoutingController } from './delivery-routing.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [DeliveryRoutingService, PrismaService],
  controllers: [DeliveryRoutingController],
  exports: [DeliveryRoutingService],
})
export class DeliveryRoutingModule {}