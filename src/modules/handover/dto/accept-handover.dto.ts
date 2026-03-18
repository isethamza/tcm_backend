import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class AcceptHandoverDto {
  @ApiProperty({
    description: 'Indicates whether the handover is accepted (true) or rejected (false)',
    example: true,
  })
  @IsBoolean({ message: 'Accept must be a boolean value' })
  accept: boolean;
}