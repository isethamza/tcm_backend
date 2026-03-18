"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveBookingWatermark = resolveBookingWatermark;
const client_1 = require("@prisma/client");
function resolveBookingWatermark(booking) {
    if (booking.status === client_1.BookingStatus.CANCELLED) {
        return 'CANCELLED';
    }
    if (booking.remainingAmount <= 0) {
        return 'PAID';
    }
    return 'PAY_AT_PICKUP';
}
//# sourceMappingURL=booking-watermark.util.js.map