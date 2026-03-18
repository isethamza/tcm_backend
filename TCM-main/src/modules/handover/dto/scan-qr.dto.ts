import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ScanQRCodeDto {
  @ApiProperty({
    description: 'The token scanned from the QR code.',
  })
  @IsString()
  token: string;
}