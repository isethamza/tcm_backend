import QRCode from 'qrcode';

export async function generateBookingQr(data: {
  bookingId: string;
  reference: string;
}): Promise<Buffer> {
  const payload = JSON.stringify({
    bookingId: data.bookingId,
    ref: data.reference,
  });

  return QRCode.toBuffer(payload, {
    type: 'png',
    errorCorrectionLevel: 'H',
    margin: 2,
    scale: 6,
  });
}
