import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InsuranceService } from './insurance.service';
import { CreateBookingInsuranceDto } from './dto/create-booking-insurance.dto';

@ApiTags('Insurance')
@Controller('insurance')
export class InsuranceController {
  constructor(private readonly service: InsuranceService) {}

  @Post('attach')
  @ApiOperation({ summary: 'Attach insurance to a booking' })
  attachInsurance(@Body() dto: CreateBookingInsuranceDto) {
    return this.service.attachInsurance(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get insurance details' })
  getInsurance(@Param('id') id: string) {
    return this.service.getInsurance(id);
  }
}