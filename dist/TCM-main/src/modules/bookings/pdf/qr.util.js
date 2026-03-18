"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBookingQr = generateBookingQr;
const qrcode_1 = require("qrcode");
async function generateBookingQr(bookingId, reference) {
    const payload = JSON.stringify({
        bookingId,
        reference,
    });
    return qrcode_1.default.toDataURL(payload, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 200,
    });
}
//# sourceMappingURL=qr.util.js.map