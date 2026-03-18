import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AttachTripStopDto {
  @ApiProperty({
    example: 'trip_uuid',
    description: 'Trip to attach this stop to',
  })
  @IsUUID()
  tripId: string;
}