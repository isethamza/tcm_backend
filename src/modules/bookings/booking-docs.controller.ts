import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Response } from 'express';

import { BookingDocsService } from './booking-docs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PdfLang } from './pdf/booking.i18n';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiProduces,
} from '@nestjs/swagger';

@ApiTags('Booking Documents')
@ApiBearerAuth()
@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingDocsController {
  constructor(private readonly docs: BookingDocsService) {}

  /* ============================================
     DOWNLOAD BOOKING PDF
     GET /bookings/:id/pdf?lang=en
  ============================================ */
  @Get(':id/pdf')
  @ApiOperation({ summary: 'Download booking PDF document' })
  @ApiParam({ name: 'id', type: String })
  @ApiQuery({
    name: 'lang',
    required: false,
    enum: ['en', 'fr'],
  })
  @ApiProduces('application/pdf')
  async downloadPdf(
    @Param('id', ParseUUIDPipe) bookingId: string, // ✅ validation
    @Query('lang') lang: PdfLang = 'en',
    @Res() res: Response,
  ) {
    const pdf = await this.docs.generatePdf(bookingId, lang);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="booking-${bookingId}.pdf"`,
    );
    res.setHeader('Content-Length', pdf.length);

    return res.send(pdf); // ✅ better than res.end
  }
}