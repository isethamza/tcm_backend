import QRCode from 'qrcode';

/**
 * Generates a base64 PNG QR code
 */
export async function generateBookingQr(
  bookingId: string,
  reference: string,
) {
  const payload = JSON.stringify({
    bookingId,
    reference,
  });

  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 200,
  });
}
