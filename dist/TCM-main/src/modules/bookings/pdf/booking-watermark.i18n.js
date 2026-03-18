"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watermarkLabel = watermarkLabel;
function watermarkLabel(watermark, lang) {
    if (!watermark)
        return null;
    const map = {
        PAID: {
            en: 'PAID',
            fr: 'PAYÉ',
        },
        PAY_AT_PICKUP: {
            en: 'PAY AT PICKUP / DROP-OFF',
            fr: 'PAIEMENT À LA REMISE',
        },
        CANCELLED: {
            en: 'CANCELLED',
            fr: 'ANNULÉ',
        },
    };
    return map[watermark][lang];
}
//# sourceMappingURL=booking-watermark.i18n.js.map