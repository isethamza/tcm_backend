import { IsOptional, IsDateString, IsInt, Min } from 'class-validator';

export class UpdateTripDto {
  @IsOptional()
  @IsDateString()
  departureDate?: string;

  @IsOptional()
  @IsDateString()
  arrivalDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacityKg?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacityM3?: number;
  
  @IsOptional()
  @IsInt()
  @Min(0)
  pickupAddonFee?: number;
}
