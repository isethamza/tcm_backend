import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTripStopDto } from './dto/create-tripstop.dto';
import { UpdateTripStopDto } from './dto/update-tripstop.dto';
import { ActivateTripStopDto } from './dto/activate-tripstop.dto';

@Injectable()
export class TripStopService {
  constructor(private readonly prisma: PrismaService) {}

  // =====================================================
  // HELPERS
  // =====================================================

  private async getOwnedTrip(tripId: string, transporteurId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      select: { id: true, transporteurId: true },
    });

    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.transporteurId !== transporteurId) {
      throw new ForbiddenException('Not your trip');
    }

    return trip;
  }

  private async getOwnedStop(stopId: string, transporteurId: string) {
    const stop = await this.prisma.tripStop.findUnique({
      where: { id: stopId },
      include: {
        dropoffBookings: true,
        deliveryBookings: true,
      },
    });

    if (!stop) throw new NotFoundException('Stop not found');
    if (stop.transporteurId !== transporteurId) {
      throw new ForbiddenException('Not your stop');
    }

    return stop;
  }

  private ensureNotUsed(stop: any) {
    if (
      stop.dropoffBookings.length > 0 ||
      stop.deliveryBookings.length > 0
    ) {
      throw new BadRequestException(
        'Stop already used in bookings',
      );
    }
  }

  // =====================================================
  // CREATE
  // =====================================================

async create(transporteurId: string, dto: CreateTripStopDto) {
  if (dto.tripId) {
    await this.getOwnedEditableTrip(dto.tripId, transporteurId);
  }

  const order = dto.tripId
    ? await this.getNextOrder(dto.tripId)
    : null;

  return this.prisma.tripStop.create({
    data: {
      name: dto.name,
      country: dto.country,
      city: dto.city,

      order,

      transporteur: {
        connect: { id: transporteurId },
      },

      trip: dto.tripId
        ? { connect: { id: dto.tripId } }
        : undefined,

      address: dto.address,
      openDate: dto.openDate,
      openTime: dto.openTime,
      closeTime: dto.closeTime,

      allowDropoff: dto.allowDropoff ?? true,
      allowPickup: dto.allowPickup ?? true,
    },
  });
}
  // =====================================================
  // REORDER STOP
  // =====================================================
async reorder(
  transporteurId: string,
  tripId: string,
  stopIds: string[],
) {
  await this.getOwnedEditableTrip(tripId, transporteurId);

  const stops = await this.prisma.tripStop.findMany({
    where: { tripId },
    include: {
      dropoffBookings: true,
      deliveryBookings: true,
    },
  });

  if (stops.length !== stopIds.length) {
    throw new BadRequestException('Invalid stop list');
  }

  const stopMap = new Map(stops.map((s) => [s.id, s]));

  for (const id of stopIds) {
    if (!stopMap.has(id)) {
      throw new BadRequestException(
        `Stop ${id} does not belong to trip`,
      );
    }
  }

  // 🔒 Prevent reorder if used
  for (const stop of stops) {
    if (
      stop.dropoffBookings.length > 0 ||
      stop.deliveryBookings.length > 0
    ) {
      throw new BadRequestException(
        'Cannot reorder stops already used in bookings',
      );
    }
  }

  return this.prisma.$transaction(
    stopIds.map((id, index) =>
      this.prisma.tripStop.update({
        where: { id },
        data: { order: index + 1 },
      }),
    ),
  );
}
  // =====================================================
  // ATTACH
  // =====================================================

  async attach(
    transporteurId: string,
    stopId: string,
    tripId: string,
  ) {
    const stop = await this.getOwnedStop(stopId, transporteurId);
    await this.getOwnedTrip(tripId, transporteurId);

    return this.prisma.tripStop.update({
      where: { id: stop.id },
      data: {
        trip: { connect: { id: tripId } },
      },
    });
  }

  // =====================================================
  // ACTIVATE
  // =====================================================

  async activate(
    transporteurId: string,
    stopId: string,
    dto: ActivateTripStopDto,
  ) {
    const stop = await this.getOwnedStop(stopId, transporteurId);

    return this.prisma.tripStop.update({
      where: { id: stop.id },
      data: {
        address: dto.address,
        openDate: dto.openDate,
        openTime: dto.openTime,
        closeTime: dto.closeTime,
      },
    });
  }

  // =====================================================
  // UPDATE
  // =====================================================

  async update(
    transporteurId: string,
    id: string,
    dto: UpdateTripStopDto,
  ) {
    const stop = await this.getOwnedStop(id, transporteurId);

    this.ensureNotUsed(stop);

    return this.prisma.tripStop.update({
      where: { id: stop.id },
      data: dto,
    });
  }

  // =====================================================
  // LIST
  // =====================================================

  async listMyStops(transporteurId: string) {
    return this.prisma.tripStop.findMany({
      where: { transporteurId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listTripStops(tripId: string) {
    return this.prisma.tripStop.findMany({
      where: { tripId },
      orderBy: { createdAt: 'asc' },
    });
  }


private async getOwnedEditableTrip(
  tripId: string,
  transporteurId: string,
) {
  const trip = await this.prisma.trip.findUnique({
    where: { id: tripId },
    select: {
      id: true,
      transporteurId: true,
      status: true,
    },
  });

  if (!trip) throw new NotFoundException('Trip not found');

  if (trip.transporteurId !== transporteurId) {
    throw new ForbiddenException('Not your trip');
  }

  const editableStatuses = ['CREATED', 'PREPAID'];

  if (!editableStatuses.includes(trip.status)) {
    throw new BadRequestException(
      'Trip cannot be modified at this stage',
    );
  }

  return trip;
}

  // =====================================================
  // GET NEXT STOP ORDER
  // =====================================================

private async getNextOrder(tripId: string) {
  const lastStop = await this.prisma.tripStop.findFirst({
    where: { tripId },
    orderBy: { order: 'desc' },
  });

  return lastStop ? (lastStop.order ?? 0) + 1 : 1;
}
  // =====================================================
  // CALCULATE  DISCTANCE
  // =====================================================
private calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}


  // =====================================================
  // DELETE
  // =====================================================

  async delete(transporteurId: string, id: string) {
    const stop = await this.getOwnedStop(id, transporteurId);

    this.ensureNotUsed(stop);

    return this.prisma.tripStop.delete({
      where: { id: stop.id },
    });
  }
}