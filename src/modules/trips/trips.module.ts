import { Module } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { KycModule } from '../kyc/kyc.module';
import { PublicTripsController } from './public-trips.controller';


@Module({
  imports: [PrismaModule , KycModule],
  controllers: [TripsController, PublicTripsController],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}
