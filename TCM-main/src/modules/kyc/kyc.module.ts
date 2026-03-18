import { Module } from '@nestjs/common';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditModule } from '../audit/audit.module';
import { KycApprovedGuard } from './kyc-approved.guard';


@Module({
  imports: [
    AuditModule, // 🔴 THIS IS THE FIX
  ],
  controllers: [KycController],
  providers: [KycService, PrismaService, KycApprovedGuard],
  exports: [KycApprovedGuard],
})
export class KycModule {}

