import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HandoverService } from './handover.service';
import { HandoverTokenService } from './handover-token.service';
import { HandoverTokenController } from './handover-token.controller';

@Module({
  imports: [],
  providers: [PrismaService, HandoverService, HandoverTokenService],
  controllers: [HandoverTokenController],
  exports: [HandoverTokenService],
})
export class HandoverTokenModule {}