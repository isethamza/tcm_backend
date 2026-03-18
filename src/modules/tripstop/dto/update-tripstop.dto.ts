import { PartialType } from '@nestjs/swagger';
import { CreateTripStopDto } from './create-tripstop.dto';

export class UpdateTripStopDto extends PartialType(CreateTripStopDto) {}