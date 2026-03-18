import { Module } from '@nestjs/common';
import { HandoverBatchController } from './handover-batch.controller';
import { HandoverBatchService } from './handover-batch.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [HandoverBatchController],
  providers: [HandoverBatchService, PrismaService],
  exports: [HandoverBatchService],
})
export class HandoverBatchModule {}