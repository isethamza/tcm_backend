import { Module } from '@nestjs/common';
import { geoQueue } from './geo.queue';

@Module({
  providers: [
    {
      provide: 'GEO_QUEUE',
      useValue: geoQueue,
    },
  ],
  exports: ['GEO_QUEUE'], // 🔥 CRITICAL
})
export class GeoModule {}