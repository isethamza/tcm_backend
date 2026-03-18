import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { UserRole } from '@prisma/client';

import { BookingsService } from './bookings.service';
import { PricingService } from '../pricing/pricing.service';

import { CreateBookingDto } from './dto/create-booking.dto';
import { PreviewPriceDto } from './dto/preview-price.dto';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard) // ✅ FIXED
export class BookingsController {
  constructor(
    private readonly bookings: BookingsService,
    private readonly pricingService: PricingService,
  ) {}

  /* =============================
     PRICE PREVIEW
  ============================= */
  @Post('preview-price')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Preview booking pricing' })
  @ApiBody({ type: PreviewPriceDto })
  @ApiResponse({ status: 200, description: 'Pricing calculated' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  preview(@Body() dto: PreviewPriceDto) {
    return this.pricingService.preview(dto);
  }

  /* =============================
     CREATE BOOKING
  ============================= */
  @Post()
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiBody({ type: CreateBookingDto })
  @ApiResponse({ status: 201, description: 'Booking created' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  create(@Req() req: any, @Body() dto: CreateBookingDto) {
    return this.bookings.create(req.user.id, dto);
  }

  /* =============================
     CLIENT — MY BOOKINGS
  ============================= */
  @Get('my')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Get my bookings' })
  @ApiResponse({ status: 200, description: 'List of bookings' })
  myBookings(@Req() req: any) {
    return this.bookings.myBookings(req.user.id);
  }

  /* =============================
     GET BOOKING
  ============================= */
  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Booking ID',
  })
  @ApiResponse({ status: 200, description: 'Booking retrieved' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  getOne(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bookings.getBooking(id, req.user);
  }
}