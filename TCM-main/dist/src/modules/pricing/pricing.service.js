"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
let PricingService = class PricingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    volumetricWeight(p) {
        return (p.lengthCm * p.widthCm * p.heightCm) / 5000;
    }
    chargeableWeight(p) {
        return Math.max(p.weightKg, this.volumetricWeight(p));
    }
    priceParcel(parcel, rules) {
        const volumetric = this.volumetricWeight(parcel);
        const chargeable = this.chargeableWeight(parcel);
        const rule = rules.find(r => chargeable >= r.minKg && chargeable < r.maxKg);
        if (!rule) {
            throw new common_1.BadRequestException(`No pricing rule for ${chargeable.toFixed(2)}kg`);
        }
        const finalPrice = chargeable * rule.price;
        return {
            id: (0, crypto_1.randomUUID)(),
            ...parcel,
            volumetricWeightKg: volumetric,
            chargeableWeightKg: chargeable,
            finalPrice: Number(finalPrice.toFixed(2)),
        };
    }
    async computeInsurance(input) {
        if (!input)
            return null;
        const plan = await this.prisma.insurancePlan.findUnique({
            where: { id: input.planId },
        });
        if (!plan || !plan.active) {
            throw new common_1.BadRequestException('Invalid insurance plan');
        }
        const coverage = Math.min(input.declaredValue, plan.maxCoverage);
        const premium = Math.max(input.declaredValue * (plan.percentageRate / 100), plan.minPremium);
        return {
            planId: plan.id,
            premium: Number(premium.toFixed(2)),
            coverage: Number(coverage.toFixed(2)),
        };
    }
    async preview(dto) {
        const trip = await this.prisma.trip.findUnique({
            where: { id: dto.tripId },
            include: { pricingRules: true },
        });
        if (!trip)
            throw new common_1.BadRequestException('Trip not found');
        const platform = await this.prisma.platformPricing.findUnique({
            where: { country: trip.departureCountry },
        });
        if (!platform) {
            throw new common_1.BadRequestException(`No platform pricing for ${trip.departureCountry}`);
        }
        const parcels = dto.parcels.map(p => this.priceParcel(p, trip.pricingRules));
        const deliveryPrice = parcels.reduce((sum, p) => sum + p.finalPrice, 0);
        let pickupFee = 0;
        if (dto.pickupOption === client_1.PickupOption.STANDARD_HOME_PICKUP ||
            dto.pickupOption === client_1.PickupOption.ADVANCED_HOME_PICKUP) {
            pickupFee = trip.pickupAddonFee ?? 0;
        }
        const deliveryFee = trip.deliveryAddonFee ?? 0;
        const hubPickupFee = dto.pickupOption === client_1.PickupOption.SELF_DROPOFF_AT_HUB
            ? platform.hubPickupFee ?? 0
            : 0;
        const hubDeliveryFee = dto.deliveryOption === client_1.DeliveryOption.HUB_PICKUP
            ? platform.hubDeliveryFee ?? 0
            : 0;
        const serviceFee = platform.serviceFeeFlat ?? 0;
        const insurance = await this.computeInsurance(dto.insurance);
        const insuranceFee = insurance?.premium ?? 0;
        const totalPrice = deliveryPrice +
            pickupFee +
            deliveryFee +
            hubPickupFee +
            hubDeliveryFee +
            serviceFee +
            insuranceFee;
        const commissionRate = platform.commissionRate ?? 0;
        const commissionBase = deliveryPrice + deliveryFee + pickupFee;
        const commission = commissionBase * commissionRate;
        const prepaidAmount = Number((totalPrice * 0.15).toFixed(2));
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
            remainingAmount: Number((totalPrice - prepaidAmount).toFixed(2)),
            financials: {
                commission: Number(commission.toFixed(2)),
                transporteurEarnings: Number((commissionBase - commission).toFixed(2)),
            },
        };
    }
};
exports.PricingService = PricingService;
exports.PricingService = PricingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PricingService);
//# sourceMappingURL=pricing.service.js.map