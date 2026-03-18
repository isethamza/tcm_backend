import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsUUID,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class AutoGroupBatchDto {
  @ApiProperty({
    type: [String],
    description: 'Parcel IDs to group automatically',
    example: [
      'a3f1c2d4-1234-4abc-9def-1234567890ab',
      'b4e2d3c5-5678-4def-8abc-0987654321cd',
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500) // 🔥 protect backend (tune as needed)
  @Type(() => String)
  @Transform(({ value }) =>
    Array.isArray(value)
      ? [...new Set(value.map(v => v.trim()))] // dedupe + trim
      : value,
  )
  @IsUUID('4', { each: true })
  parcelIds: string[];
}