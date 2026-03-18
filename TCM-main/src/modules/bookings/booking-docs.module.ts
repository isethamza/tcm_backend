import { Module } from '@nestjs/common';
import { BookingDocsController } from './booking-docs.controller';
import { BookingDocsService } from './booking-docs.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BookingDocsController],
  providers: [BookingDocsService],
})
export class BookingDocsModule {}
