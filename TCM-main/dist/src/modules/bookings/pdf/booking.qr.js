"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBookingQr = generateBookingQr;
const qrcode_1 = require("qrcode");
async function generateBookingQr(data) {
    const payload = JSON.stringify({
        bookingId: data.bookingId,
        ref: data.reference,
    });
    return qrcode_1.default.toBuffer(payload, {
        type: 'png',
        errorCorrectionLevel: 'H',
        margin: 2,
        scale: 6,
    });
}
//# sourceMappingURL=booking.qr.js.map