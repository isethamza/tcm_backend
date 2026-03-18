import { Module } from '@nestjs/common';
import { TripStopService } from './tripstop.service';
import { TripStopController } from './tripstop.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [TripStopController],
  providers: [TripStopService, PrismaService],
  exports: [TripStopService],
})
export class TripStopModule {}