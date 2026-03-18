import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class ScanPickupDto {
  @ApiProperty({
    description: 'Booking ID scanned from QR code',
    example: '151d1de6-530a-4e5d-893b-ebaa8bdf9984',
    format: 'uuid',
  })
  @IsUUID('4')
  @IsNotEmpty()
  bookingId: string;
}