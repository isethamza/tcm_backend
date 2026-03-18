import { Module } from '@nestjs/common';
import { InsuranceService } from './insurance.service';
import { InsuranceController } from './insurance.controller';
import { ClaimsService } from './claims/claims.service';
import { ClaimsController } from './claims/claims.controller';
import { PrismaService } from '../../prisma/prisma.service';
@Module({
  controllers: [InsuranceController, ClaimsController],
  providers: [InsuranceService, ClaimsService, PrismaService],
  exports: [InsuranceService],
})
export class InsuranceModule {}