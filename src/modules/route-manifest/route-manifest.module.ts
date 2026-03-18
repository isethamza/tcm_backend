import { Module } from '@nestjs/common';
import { RouteManifestService } from './route-manifest.service';
import { RouteManifestController } from './route-manifest.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [RouteManifestService, PrismaService],
  controllers: [RouteManifestController],
})
export class RouteManifestModule {}