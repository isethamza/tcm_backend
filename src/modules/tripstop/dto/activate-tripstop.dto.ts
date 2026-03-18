import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, Matches } from 'class-validator';

export class ActivateTripStopDto {
  @ApiProperty({ example: '12 Rue de Rivoli' })
  @IsString()
  address: string;

  @ApiProperty({ example: '2026-03-10' })
  @IsDateString()
  openDate: string;

  @ApiProperty({ example: '08:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'openTime must be HH:mm format',
  })
  openTime: string;

  @ApiProperty({ example: '18:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'closeTime must be HH:mm format',
  })
  closeTime: string;
}