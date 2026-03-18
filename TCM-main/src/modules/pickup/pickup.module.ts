import { Module } from '@nestjs/common';
import { PickupController } from './pickup.controller';
import { PickupService } from './pickup.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';

@Module({
  controllers: [PickupController],
  providers: [PickupService, PrismaService, LedgerService],
})
export class PickupModule {}
