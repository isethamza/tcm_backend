import { PdfLang } from './booking.i18n';
import { PdfWatermark } from './booking-watermark.util';

export function watermarkLabel(
  watermark: PdfWatermark,
  lang: PdfLang,
): string | null {
  if (!watermark) return null;

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
