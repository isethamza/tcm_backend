import { PartialType } from '@nestjs/swagger';
import { CreateRecipientDto } from './create-recipient.dto';
import {
  IsOptional,
  IsString,
  IsPhoneNumber,
  IsEmail,
  Length,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateRecipientDto extends PartialType(CreateRecipientDto) {
  
  @IsOptional()
  @IsString()
  @Length(2, 100)
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsOptional()
  @IsPhoneNumber(null) // or 'SE' if Sweden-specific
  phone?: string;

  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}