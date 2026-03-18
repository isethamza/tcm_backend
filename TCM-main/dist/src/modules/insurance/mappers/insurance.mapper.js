"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsuranceMapper = void 0;
class InsuranceMapper {
    static toBookingInsuranceResponse(data) {
        return {
            id: data.id,
            bookingId: data.bookingId,
            planId: data.planId,
            declaredValue: data.declaredValue,
            premiumAmount: data.premiumAmount,
            coverageAmount: data.coverageAmount,
            status: data.status,
            createdAt: data.createdAt,
        };
    }
    static toClaimResponse(data) {
        return {
            id: data.id,
            insuranceId: data.insuranceId,
            reason: data.reason,
            description: data.description,
            evidenceUrls: data.evidenceUrls,
            claimedAmount: data.claimedAmount,
            status: data.status,
            reviewedById: data.reviewedById,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        };
    }
    static toPlanResponse(plan) {
        return {
            id: plan.id,
            name: plan.name,
            description: plan.description,
            percentageRate: plan.percentageRate,
            minPremium: plan.minPremium,
            maxCoverage: plan.maxCoverage,
            active: plan.active,
            createdAt: plan.createdAt,
            updatedAt: plan.updatedAt,
        };
    }
}
exports.InsuranceMapper = InsuranceMapper;
//# sourceMappingURL=insurance.mapper.js.map