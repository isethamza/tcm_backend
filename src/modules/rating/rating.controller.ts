import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RatingService } from './rating.service';

@ApiTags('Ratings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ratings')
export class RatingController {
  constructor(private readonly service: RatingService) {}

  @Post(':bookingId')
  create(
    @Param('bookingId') bookingId: string,
    @Req() req,
    @Body() body: any,
  ) {
    return this.service.createRating({
      bookingId,
      clientId: req.user.id,
      ...body,
    });
  }

  @Get('transporteur/:id')
  summary(@Param('id') id: string) {
    return this.service.getTransporteurRatingSummary(
      id,
    );
  }

  @Get('transporteur/:id/reviews')
  reviews(@Param('id') id: string) {
    return this.service.getTransporteurReviews(
      id,
    );
  }
}
