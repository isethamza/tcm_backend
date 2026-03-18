import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { PricingService } from './pricing.service';
import { PreviewPriceDto } from '../bookings/dto/preview-price.dto';

@ApiTags('Pricing')
@Controller('pricing')
@UseGuards(JwtAuthGuard)
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  /**
   * Preview booking pricing (multi-parcel, full pricing engine)
   */
  @Post('preview')
  @ApiOperation({ summary: 'Preview booking pricing' })
  @ApiResponse({ status: 200, description: 'Pricing calculated' })
  async preview(@Body() dto: PreviewPriceDto) {
    return this.pricingService.preview(dto);
  }
}