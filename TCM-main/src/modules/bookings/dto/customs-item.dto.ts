import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CustomsItemDto {
  @ApiProperty({
    description: 'Item description',
    example: 'Clothes',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Quantity of the item',
    example: 2,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Value per item',
    example: 50,
  })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiProperty({
    description: 'HS code (customs tariff number)',
    example: '200811',
    required: false,
  })
  @IsOptional()
  @IsString()
  hsCode?: string;
}


