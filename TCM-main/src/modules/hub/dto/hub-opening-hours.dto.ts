import {
  IsEnum,
  IsBoolean,
  IsString,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum WeekDay {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export class HubOpeningHoursDto {
  @ApiProperty({
    enum: WeekDay,
    example: WeekDay.MONDAY,
    description: 'Day of the week',
  })
  @IsEnum(WeekDay)
  day: WeekDay;

  @ApiProperty({
    example: true,
    description: 'Whether hub is open that day',
  })
  @IsBoolean()
  isOpen: boolean;

  @ApiProperty({
    example: '08:00',
    description: 'Opening time (HH:mm)',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'openTime must be in HH:mm format',
  })
  openTime: string;

  @ApiProperty({
    example: '18:00',
    description: 'Closing time (HH:mm)',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'closeTime must be in HH:mm format',
  })
  closeTime: string;
}
