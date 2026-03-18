"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsurancePolicy = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
class InsurancePolicy {
    static validateBooking(booking) {
        if (!booking) {
            throw new common_1.BadRequestException('Booking not found');
        }
        if (booking.status !== client_1.BookingStatus.CREATED) {
            throw new common_1.BadRequestException('Insurance can only be attached to pending bookings');
        }
    }
    static validatePlan(plan) {
        if (!plan || !plan.active) {
            throw new common_1.BadRequestException('Invalid or inactive insurance plan');
        }
    }
    static ensureNoExistingInsurance(existing) {
        if (existing) {
            throw new common_1.BadRequestException('Insurance already exists for this booking');
        }
    }
}
exports.InsurancePolicy = InsurancePolicy;
//# sourceMappingURL=insurance.policy.js.map