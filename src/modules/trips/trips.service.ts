import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { KycStatus, UserRole, TripStatus } from '@prisma/client';
import { UpdateTripDto } from './dto/update-trip.dto';
import { CreateTripDto } from './dto/create-trip.dto';

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  /* ======================================================
     INTERNAL: Load trip owned by transporteur
  ====================================================== */
  private async getOwnedTrip(tripId: string, userId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        pricingRules: true,
        _count: { select: { bookings: true } },
      },
    });

    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.transporteurId !== userId)
      throw new ForbiddenException('Access denied');

    return {
      ...trip,
      bookingsCount: trip._count.bookings,
    };
  }

  /* ======================================================
     CREATE TRIP
  ====================================================== */
async create(dto: CreateTripDto, userId: string, role: UserRole) {
  if (role !== UserRole.TRANSPORTEUR) {
    throw new ForbiddenException('Only transporteurs can create trips');
  }

  const approvedKyc = await this.prisma.kyc.findFirst({
    where: { userId, status: KycStatus.APPROVED },
  });

  if (!approvedKyc) {
    throw new ForbiddenException('KYC approval required');
  }

  if (!dto.pricingRules?.length) {
    throw new BadRequestException('Pricing rules are required');
  }

  if (dto.capacityKg <= 0 || dto.capacityM3 <= 0) {
    throw new BadRequestException('Capacities must be greater than zero');
  }

  return this.prisma.trip.create({
    data: {
      transporteurId: userId,

      departureCountry: dto.departureCountry,
      departureCity: dto.departureCity,
      arrivalCountry: dto.arrivalCountry,
      arrivalCity: dto.arrivalCity,

      departureDate: new Date(dto.departureDate),
      arrivalDate: new Date(dto.arrivalDate),

      capacityKg: dto.capacityKg,
      capacityM3: dto.capacityM3, // ✅

      pickupAddonFee: dto.pickupAddonFee ?? null,

      pricingRules: {
        create: dto.pricingRules.map(r => ({
          minKg: r.minKg,
          maxKg: r.maxKg,
          price: r.price,
        })),
      },
    },
    include: {
      pricingRules: true,
      _count: { select: { bookings: true } },
    },
  }).then(trip => ({
    ...trip,
    bookingsCount: trip._count.bookings,
  }));
}

  /* ======================================================
     TRANSPORTEUR — MY TRIPS
  ====================================================== */
  async myTrips(userId: string) {
    const trips = await this.prisma.trip.findMany({
      where: { transporteurId: userId },
      orderBy: { departureDate: 'asc' },
      include: {
        _count: { select: { bookings: true } },
      },
    });

    return trips.map(t => ({
      ...t,
      bookingsCount: t._count.bookings,
    }));
  }

  /* ======================================================
     TRANSPORTEUR — GET ONE TRIP
  ====================================================== */
  async getTripById(tripId: string, userId: string) {
    return this.getOwnedTrip(tripId, userId);
  }

  /* ======================================================
     PUBLIC SEARCH
  ====================================================== */
  async search(params: { from?: string; to?: string; date?: string }) {
    const trips = await this.prisma.trip.findMany({
      where: {
        departureCountry: params.from,
        arrivalCountry: params.to,
        departureDate: params.date
          ? { gte: new Date(params.date) }
          : undefined,
        status: TripStatus.PUBLISHED,
        transporteur: { status: 'ACTIVE' },
      },
      include: {
        transporteur: { select: { id: true, email: true } },
        _count: { select: { bookings: true } },
      },
    });

    return trips.map(t => ({
      ...t,
      bookingsCount: t._count.bookings,
    }));
  }


  /* ======================================================
     SEARCH Country/City/KgPrice
  ====================================================== */
async searchAdvanced(params: {
  fromCountry?: string;
  fromCity?: string;
  toCountry?: string;
  toCity?: string;
  date?: string;
  maxPriceKg?: number;
}) {
  return this.prisma.trip.findMany({
    where: {
      departureCountry: params.fromCountry,
      departureCity: params.fromCity,
      arrivalCountry: params.toCountry,
      arrivalCity: params.toCity,
      departureDate: params.date
        ? { gte: new Date(params.date) }
        : undefined,
      pricingRules: params.maxPriceKg
        ? {
            some: {
              price: { lte: params.maxPriceKg },
            },
          }
        : undefined,
      status: 'PUBLISHED',
    },
    include: {
      transporteur: { select: { id: true, email: true } },
      _count: { select: { bookings: true } },
    },
  });
}


  /* ======================================================
     UPDATE TRIP (NO BOOKINGS)
  ====================================================== */
  async updateTrip(
    tripId: string,
    transporteurId: string,
    dto: UpdateTripDto,
  ) {
    const trip = await this.getOwnedTrip(tripId, transporteurId);

    if (trip.status === TripStatus.CANCELLED)
      throw new BadRequestException('Trip is cancelled');
	// capacity validation
	if (dto.capacityKg !== undefined && dto.capacityKg <= 0) {
	throw new BadRequestException('capacityKg must be greater than zero');
	}

	if (dto.capacityM3 !== undefined && dto.capacityM3 <= 0) {
	throw new BadRequestException('capacityM3 must be greater than zero');
	}

    if (trip.bookingsCount > 0)
      throw new BadRequestException('Cannot modify trip with bookings');

    return this.prisma.trip.update({
      where: { id: tripId },
      data: dto,
    });
  }

  /* ======================================================
     STATUS ACTIONS
  ====================================================== */
  async publish(id: string, userId: string) {
    const trip = await this.getOwnedTrip(id, userId);

    if (trip.status !== TripStatus.DRAFT)
      throw new BadRequestException('Only draft trips can be published');

    return this.prisma.trip.update({
      where: { id },
      data: { status: TripStatus.PUBLISHED },
    });
  }

  async putBackToDraft(id: string, userId: string) {
    const trip = await this.getOwnedTrip(id, userId);

    if (trip.bookingsCount > 0)
      throw new BadRequestException('Cannot revert with bookings');

    return this.prisma.trip.update({
      where: { id },
      data: { status: TripStatus.DRAFT },
    });
  }

  async hold(id: string, userId: string) {
    await this.getOwnedTrip(id, userId);

    return this.prisma.trip.update({
      where: { id },
      data: { status: TripStatus.ON_HOLD },
    });
  }

  async resume(id: string, userId: string) {
    await this.getOwnedTrip(id, userId);

    return this.prisma.trip.update({
      where: { id },
      data: { status: TripStatus.PUBLISHED },
    });
  }
async delay(id: string, newDate: string, userId: string) {
  const trip = await this.getOwnedTrip(id, userId);

  if (!newDate) {
    throw new BadRequestException('New departure date is required');
  }

  const parsedDate = new Date(newDate);

  if (isNaN(parsedDate.getTime())) {
    throw new BadRequestException('Invalid date format');
  }

  if (parsedDate <= new Date(trip.departureDate)) {
    throw new BadRequestException(
      'New departure date must be after current departure date',
    );
  }

  if (parsedDate <= new Date()) {
    throw new BadRequestException(
      'New departure date must be in the future',
    );
  }

  return this.prisma.trip.update({
    where: { id },
    data: {
      departureDate: parsedDate,
      status: TripStatus.DELAYED,
    },
  });
}

  /* ======================================================
     CANCEL
  ====================================================== */
  async cancelTrip(id: string, userId: string) {
    const trip = await this.getOwnedTrip(id, userId);

    if (trip.status === TripStatus.CANCELLED)
      throw new BadRequestException('Already cancelled');

    return this.prisma.trip.update({
      where: { id },
      data: {
        status: TripStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });
  }
    /* ======================================================
     PUBLIC TRIP DETAILS USED MAINLY BY CLIENT 
  ====================================================== */
  async getPublicTripById(tripId: string) {
  const trip = await this.prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      pricingRules: true,
      transporteur: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  if (!trip || trip.status !== TripStatus.PUBLISHED) {
    throw new NotFoundException('Trip not found');
  }

  return trip;
}

  
}
