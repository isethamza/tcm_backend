import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Trip, TripPricingRule, PickupOption, DeliveryOption } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  /* =====================================================
     HELPERS
  ===================================================== */

  private volumetricWeight(p: {
    lengthCm: number;
    widthCm: number;
    heightCm: number;
  }): number {
    return (p.lengthCm * p.widthCm * p.heightCm) / 5000;
  }

  private chargeableWeight(p: {
    weightKg: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
  }): number {
    return Math.max(p.weightKg, this.volumetricWeight(p));
  }

  private priceParcel(
    parcel: any,
    rules: TripPricingRule[],
  ) {
    const volumetric = this.volumetricWeight(parcel);
    const chargeable = this.chargeableWeight(parcel);

    const rule = rules.find(
      r => chargeable >= r.minKg && chargeable < r.maxKg,
    );

    if (!rule) {
      throw new BadRequestException(
        `No pricing rule for ${chargeable.toFixed(2)}kg`,
      );
    }

    const finalPrice = chargeable * rule.price;

    return {
      id: randomUUID(),
      ...parcel,
      volumetricWeightKg: volumetric,
      chargeableWeightKg: chargeable,
      finalPrice: Number(finalPrice.toFixed(2)),
    };
  }

  /* =====================================================
     INSURANCE
  ===================================================== */

  private async computeInsurance(input?: {
    planId: string;
    declaredValue: number;
  }) {
    if (!input) return null;

    const plan = await this.prisma.insurancePlan.findUnique({
      where: { id: input.planId },
    });

    if (!plan || !plan.active) {
      throw new BadRequestException('Invalid insurance plan');
    }

    const coverage = Math.min(
      input.declaredValue,
      plan.maxCoverage,
    );

    const premium = Math.max(
      input.declaredValue * (plan.percentageRate / 100),
      plan.minPremium,
    );

    return {
      planId: plan.id,
      premium: Number(premium.toFixed(2)),
      coverage: Number(coverage.toFixed(2)),
    };
  }

  /* =====================================================
     PREVIEW (SOURCE OF TRUTH)
  ===================================================== */

  async preview(dto: {
    tripId: string;
    parcels: any[];
    pickupOption: PickupOption;
    deliveryOption: DeliveryOption;
    insurance?: {
      planId: string;
      declaredValue: number;
    };
  }) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: dto.tripId },
      include: { pricingRules: true },
    });

    if (!trip) throw new BadRequestException('Trip not found');

    const platform = await this.prisma.platformPricing.findUnique({
      where: { country: trip.departureCountry },
    });

    if (!platform) {
      throw new BadRequestException(
        `No platform pricing for ${trip.departureCountry}`,
      );
    }

    /* ===============================
       PARCELS
    =============================== */

    const parcels = dto.parcels.map(p =>
      this.priceParcel(p, trip.pricingRules),
    );

    const deliveryPrice = parcels.reduce(
      (sum, p) => sum + p.finalPrice,
      0,
    );

    /* ===============================
       FEES
    =============================== */

    let pickupFee = 0;

    if (
      dto.pickupOption === PickupOption.STANDARD_HOME_PICKUP ||
      dto.pickupOption === PickupOption.ADVANCED_HOME_PICKUP
    ) {
      pickupFee = trip.pickupAddonFee ?? 0;
    }

    const deliveryFee = trip.deliveryAddonFee ?? 0;

    const hubPickupFee =
      dto.pickupOption === PickupOption.SELF_DROPOFF_AT_HUB
        ? platform.hubPickupFee ?? 0
        : 0;

    const hubDeliveryFee =
      dto.deliveryOption === DeliveryOption.HUB_PICKUP
        ? platform.hubDeliveryFee ?? 0
        : 0;

    const serviceFee = platform.serviceFeeFlat ?? 0;

    /* ===============================
       INSURANCE
    =============================== */

    const insurance = await this.computeInsurance(dto.insurance);
    const insuranceFee = insurance?.premium ?? 0;

    /* ===============================
       TOTAL
    =============================== */

    const totalPrice =
      deliveryPrice +
      pickupFee +
      deliveryFee +
      hubPickupFee +
      hubDeliveryFee +
      serviceFee +
      insuranceFee;

    /* ===============================
       COMMISSION
    =============================== */

    const commissionRate = platform.commissionRate ?? 0;

    const commissionBase =
      deliveryPrice + deliveryFee + pickupFee;

    const commission = commissionBase * commissionRate;

    /* ===============================
       PREPAID (BUSINESS RULE)
    =============================== */

    const prepaidAmount = Number(
      (totalPrice * 0.15).toFixed(2), // 15% deposit
    );

    /* ===============================
       RESULT
    =============================== */

    return {
      parcels,

      breakdown: {
        deliveryPrice,
        pickupFee,
        deliveryFee,
        hubPickupFee,
        hubDeliveryFee,
        serviceFee,
        insuranceFee,
      },

      insurance,

      totalPrice: Number(totalPrice.toFixed(2)),
      prepaidAmount,
      remainingAmount: Number(
        (totalPrice - prepaidAmount).toFixed(2),
      ),

      financials: {
        commission: Number(commission.toFixed(2)),
        transporteurEarnings: Number(
          (commissionBase - commission).toFixed(2),
        ),
      },
    };
  }
}