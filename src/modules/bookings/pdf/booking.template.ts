/* eslint-disable @typescript-eslint/no-var-requires */
const PDFDocument = require('pdfkit');
import * as QRCode from 'qrcode';
import { PassThrough } from 'stream';
import { BOOKING_PDF_I18N, PdfLang } from './booking.i18n';

export async function buildBookingPdf(params: {
  booking: {
    id: string;
    trip: {
      departureCountry: string;
      departureCity: string;
      arrivalCountry: string;
      arrivalCity: string;
    };
    client: {
      firstName: string;
      lastName: string;
      email: string;
    };
    recipientSnapshot: {
      name: string;
      phone: string;
      address: string;
    };
    parcels: {
      weightKg: number;
      lengthCm: number;
      widthCm: number;
      heightCm: number;
      finalPrice: number;
    }[];
    pickup: {
      option: string;
      details?: any;
    };
    delivery: {
      option: string;
    };
    insurance?: {
      declaredValue: number;
      premiumAmount: number;
      coverageAmount: number;
    } | null;
    totalPrice: number;
    prepaidAmount: number;
    remainingAmount: number;
  };
  lang: PdfLang;
}): Promise<Buffer> {
  const { booking, lang } = params;
  const t = BOOKING_PDF_I18N[lang] ?? BOOKING_PDF_I18N.en;

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const stream = new PassThrough();
  const chunks: Buffer[] = [];

  doc.pipe(stream);
  stream.on('data', c => chunks.push(c));

  /* ========== WATERMARK ========== */
  const watermark =
    booking.remainingAmount > 0
      ? t.unpaidWatermark
      : t.paidWatermark;

  doc
    .save()
    .rotate(-45, { origin: [300, 400] })
    .fontSize(46)
    .fillColor('gray')
    .opacity(0.15)
    .text(watermark, 80, 300, {
      align: 'center',
      width: 450,
    })
    .restore()
    .opacity(1);

  /* ========== HEADER ========== */
  doc.fontSize(20).text(t.title, { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`${t.bookingId}: ${booking.id}`);
  doc.moveDown();

  /* ========== QR CODE ========== */
  const qrBuffer = await QRCode.toBuffer(booking.id, {
    type: 'png',
    width: 120,
    margin: 1,
  });

  doc.image(qrBuffer, doc.page.width - 160, 40, { width: 100 });

  /* ========== TRIP ========== */
  section(doc, t.trip);
  field(
    doc,
    `${booking.trip.departureCountry} (${booking.trip.departureCity}) → ${booking.trip.arrivalCountry} (${booking.trip.arrivalCity})`,
  );

  /* ========== CLIENT ========== */
  section(doc, t.client);
  field(
    doc,
    `${booking.client.firstName} ${booking.client.lastName}`,
  );
  field(doc, booking.client.email);

  /* ========== RECIPIENT ========== */
  section(doc, t.recipient);
  field(doc, booking.recipientSnapshot.name);
  field(doc, booking.recipientSnapshot.phone);
  field(doc, booking.recipientSnapshot.address);

  /* ========== PARCELS ========== */
  section(doc, t.parcels);
  booking.parcels.forEach((p, i) => {
    field(
      doc,
      `${t.parcel} ${i + 1}: ${p.weightKg}kg | ${p.lengthCm}x${p.widthCm}x${p.heightCm}cm | €${p.finalPrice.toFixed(2)}`,
    );
  });

  /* ========== PICKUP ========== */
  section(doc, t.pickup);
  field(doc, `${t.option}: ${booking.pickup.option}`);

  if (booking.pickup.details) {
    if (booking.pickup.details.type === 'TRANSPORTEUR') {
      field(doc, `${t.name}: ${booking.pickup.details.name}`);
      if (booking.pickup.details.phone)
        field(doc, `${t.phone}: ${booking.pickup.details.phone}`);
      if (booking.pickup.details.address)
        field(doc, `${t.address}: ${booking.pickup.details.address}`);
    }

    if (booking.pickup.details.type === 'HUB') {
      field(doc, `${t.hub}: ${booking.pickup.details.name}`);
      field(doc, `${t.address}: ${booking.pickup.details.address}`);
      if (booking.pickup.details.openingHours)
        field(
          doc,
          `${t.openingHours}: ${booking.pickup.details.openingHours}`,
        );
    }
  }

  /* ========== DELIVERY ========== */
  section(doc, t.delivery);
  field(doc, `${t.option}: ${booking.delivery.option}`);

  /* ========== INSURANCE ========== */
  if (booking.insurance) {
    section(doc, t.insurance);
    field(
      doc,
      `${t.declaredValue}: €${booking.insurance.declaredValue}`,
    );
    field(
      doc,
      `${t.coverage}: €${booking.insurance.coverageAmount}`,
    );
    field(
      doc,
      `${t.premium}: €${booking.insurance.premiumAmount}`,
    );
  }

  /* ========== PRICING ========== */
  section(doc, t.pricing);
  field(doc, `${t.total}: €${booking.totalPrice.toFixed(2)}`);
  field(doc, `${t.paid}: €${booking.prepaidAmount.toFixed(2)}`);
  field(
    doc,
    `${t.remaining}: €${booking.remainingAmount.toFixed(2)}`,
  );

  /* ========== FOOTER ========== */
  doc
    .moveDown(2)
    .fontSize(9)
    .fillColor('gray')
    .text(t.footer, { align: 'center' });

  doc.end();

  return new Promise(resolve =>
    stream.on('end', () => resolve(Buffer.concat(chunks))),
  );
}

/* ========== HELPERS ========== */
function section(doc: any, title: string) {
  doc.moveDown().fontSize(14).fillColor('#000').text(title);
  doc.moveDown(0.3);
}

function field(doc: any, value: string) {
  doc.fontSize(11).fillColor('#000').text(value);
}