import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateBookingInsuranceDto {
  @ApiProperty({ example: 'booking_uuid' })
  @IsString()
  bookingId: string;

  @ApiProperty({ example: 'plan_uuid' })
  @IsString()
  planId: string;
}