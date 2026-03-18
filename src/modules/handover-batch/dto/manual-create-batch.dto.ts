import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { HandoverDestinationType } from '@prisma/client';

export class ManualCreateBatchDto {
  @ApiProperty({ enum: HandoverDestinationType })
  @IsEnum(HandoverDestinationType)
  type: HandoverDestinationType;

  @ApiProperty({
    description:
      'CITY → city name | HUB → hubId | TRIP_STOP → tripStopId',
    example: 'paris',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  value: string;
}