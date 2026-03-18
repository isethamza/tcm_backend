import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class RatingService {
  constructor(private prisma: PrismaService) {}

  async createRating(params: {
    bookingId: string;
    clientId: string;
    rating: number;
    comment?: string;
    punctuality?: number;
    communication?: number;
    parcelCare?: number;
  }) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: params.bookingId },
      include: { trip: true },
    });

    if (!booking)
      throw new NotFoundException('Booking not found');

    if (booking.clientId !== params.clientId)
      throw new ForbiddenException();

    if (booking.status !== BookingStatus.COMPLETED)
      throw new BadRequestException(
        'Booking must be completed before rating',
      );

    const existing =
      await this.prisma.transporteurRating.findUnique({
        where: { bookingId: params.bookingId },
      });

    if (existing)
      throw new BadRequestException(
        'Booking already rated',
      );

    if (params.rating < 1 || params.rating > 5)
      throw new BadRequestException(
        'Rating must be between 1 and 5',
      );

    const rating =
      await this.prisma.transporteurRating.create({
        data: {
          bookingId: params.bookingId,
          clientId: params.clientId,
          transporteurId:
            booking.trip.transporteurId,
          rating: params.rating,
          comment: params.comment,
          punctuality: params.punctuality,
          communication: params.communication,
          parcelCare: params.parcelCare,
        },
      });

    await this.updateTransporteurScore(
      booking.trip.transporteurId,
    );

    return rating;
  }

  async updateTransporteurScore(
    transporteurId: string,
  ) {
    const ratings =
      await this.prisma.transporteurRating.findMany({
        where: { transporteurId },
        select: { rating: true },
      });

    const total = ratings.length;
    const average =
      ratings.reduce((acc, r) => acc + r.rating, 0) /
      total;

    await this.prisma.user.update({
      where: { id: transporteurId },
      data: {
        averageRating: average,
        totalRatings: total,
      },
    });
  }

  async getTransporteurRatingSummary(
    transporteurId: string,
  ) {
    return this.prisma.user.findUnique({
      where: { id: transporteurId },
      select: {
        averageRating: true,
        totalRatings: true,
      },
    });
  }

  async getTransporteurReviews(
    transporteurId: string,
  ) {
    return this.prisma.transporteurRating.findMany({
      where: { transporteurId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
