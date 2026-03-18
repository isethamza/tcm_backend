"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimsPolicy = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
class ClaimsPolicy {
    static validateClaimCreation(insurance, claimedAmount) {
        if (insurance.status !== client_1.InsuranceStatus.ACTIVE) {
            throw new common_1.BadRequestException('Insurance not active');
        }
        if (claimedAmount > insurance.coverageAmount) {
            throw new common_1.BadRequestException('Claim exceeds coverage');
        }
        const existing = insurance.claims.find((c) => c.status !== client_1.InsuranceClaimStatus.REJECTED);
        if (existing) {
            throw new common_1.BadRequestException('Active claim already exists');
        }
    }
    static canTransition(current, next) {
        const transitions = {
            SUBMITTED: ['UNDER_REVIEW'],
            UNDER_REVIEW: ['APPROVED', 'REJECTED'],
            APPROVED: ['PAID'],
            REJECTED: [],
            PAID: [],
        };
        if (!transitions[current]?.includes(next)) {
            throw new common_1.BadRequestException(`Invalid transition from ${current} to ${next}`);
        }
    }
}
exports.ClaimsPolicy = ClaimsPolicy;
//# sourceMappingURL=claims.policy.js.map