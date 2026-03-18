import { Module } from '@nestjs/common';
import { HubController } from './hub.controller';
import { HubService } from './hub.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [HubController],
  providers: [HubService, PrismaService],
  exports: [HubService],
})
export class HubModule {}
