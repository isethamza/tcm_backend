import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HubStatus, UserRole } from '@prisma/client';

@Injectable()
export class HubService {
  constructor(private readonly prisma: PrismaService) {}

  // =============================
  // Utilities
  // =============================

  private calculateVolumeM3(
    lengthCm: number,
    widthCm: number,
    heightCm: number,
  ): number {
    return (lengthCm / 100) * (widthCm / 100) * (heightCm / 100);
  }

  // =============================
  // Create Hub (Hub Manager or Admin)
  // =============================

  async createHub(user: any, dto: any) {
    if (
      user.role !== UserRole.HUB_MANAGER &&
      user.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException();
    }

    return this.prisma.hub.create({
      data: {
        name: dto.name,
        country: dto.country,
        city: dto.city,
        address: dto.address,
        postalCode: dto.postalCode,
        type: dto.type,
        maxParcelWeightKg: dto.maxParcelWeightKg,
        maxParcelVolumeM3: dto.maxParcelVolumeM3,
        managerId: user.role === 'HUB_MANAGER' ? user.id : undefined,
        status: user.role === 'ADMIN' ? 'ACTIVE' : 'DRAFT',
        openingHours: {
          create: dto.openingHours,
        },
      },
      include: { openingHours: true },
    });
  }

  // =============================
  // Find Available Hubs
  // =============================

  async findAvailableHubs(dto: any) {
    const volume = this.calculateVolumeM3(
      dto.lengthCm,
      dto.widthCm,
      dto.heightCm,
    );

    const hubs = await this.prisma.hub.findMany({
      where: {
        country: dto.country,
        city: dto.city,
        status: HubStatus.ACTIVE,
      },
      include: { openingHours: true },
													   
		
    });

    return hubs.filter((hub) => {
      return (
        hub.occupiedWeightKg + dto.weightKg <=
          hub.maxParcelWeightKg &&

					  
        hub.occupiedVolumeM3 + volume <=
          hub.maxParcelVolumeM3
      );
								  
    });
  }

  // =============================
  // Reserve Capacity
  // =============================

  async reserveCapacity(dto: any) {
				  
					 
					 
					
					 
	  
    const volume = this.calculateVolumeM3(
      dto.lengthCm,
      dto.widthCm,
      dto.heightCm,
    );

    return this.prisma.$transaction(async (tx) => {
      const hub = await tx.hub.findUnique({
        where: { id: dto.hubId },
      });

				 
      if (!hub) throw new NotFoundException('Hub not found');
	   

      if (hub.status !== HubStatus.ACTIVE) {
        throw new BadRequestException('Hub not active');
      }

      if (
        hub.occupiedWeightKg + dto.weightKg >
        hub.maxParcelWeightKg
						 
										

      ) {
        throw new BadRequestException(
          'Hub weight capacity exceeded',
        );
      }

      if (
        hub.occupiedVolumeM3 + volume >
        hub.maxParcelVolumeM3
      ) {
        throw new BadRequestException(
          'Hub volume capacity exceeded',
        );
      }

      return tx.hub.update({
        where: { id: dto.hubId },
        data: {
          occupiedWeightKg:
            hub.occupiedWeightKg + dto.weightKg,
          occupiedVolumeM3:
            hub.occupiedVolumeM3 + volume,
        },
      });
    });
  }

  // =============================
  // Release Capacity
  // =============================
								 
				  
					 
					 
					
					 
	  
											
					  
					 
					  
	  

  async releaseCapacity(dto: any) {
    const volume = this.calculateVolumeM3(
      dto.lengthCm,
      dto.widthCm,
      dto.heightCm,
    );

    return this.prisma.hub.update({
      where: { id: dto.hubId },
      data: {
        occupiedWeightKg: {
          decrement: dto.weightKg,
        },
        occupiedVolumeM3: {
          decrement: volume,
        },
      },
    });
  }

  // =============================
  // Validate Hub Open
  // =============================

  async validateHubOpen(hubId: string, date: Date) {
    const day = date
      .toLocaleString('en-US', { weekday: 'long' })
      .toUpperCase();

    const schedule =
      await this.prisma.hubOpeningHours.findFirst({
        where: {
          hubId,
          day: day as any,
											  
						   
											  
        },
      });

    if (!schedule || schedule.isClosed) {
      throw new BadRequestException(
        'Hub closed on this day',
      );
    }

    const time = date.toTimeString().slice(0, 5);

    if (
      time < schedule.openTime ||
      time > schedule.closeTime
    ) {
      throw new BadRequestException(
        'Hub closed at this time',
      );
    }
  }

  // =============================
  // Utilization (Admin)
  // =============================

  async getHubUtilization(hubId: string) {
    const hub = await this.prisma.hub.findUnique({
      where: { id: hubId },
    });

    if (!hub) {
      throw new NotFoundException('Hub not found');
    } 

    return {
      weightUtilizationPercent:
        (hub.occupiedWeightKg /
          hub.maxParcelWeightKg) *
        100,

      volumeUtilizationPercent:
        (hub.occupiedVolumeM3 /
          hub.maxParcelVolumeM3) *
        100,

      availableWeightKg:
        hub.maxParcelWeightKg -
        hub.occupiedWeightKg,

      availableVolumeM3:
        hub.maxParcelVolumeM3 -
        hub.occupiedVolumeM3,
    };
  }
}
