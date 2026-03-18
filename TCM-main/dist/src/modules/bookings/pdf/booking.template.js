"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildBookingPdf = buildBookingPdf;
const PDFDocument = require('pdfkit');
const QRCode = require("qrcode");
const stream_1 = require("stream");
const booking_i18n_1 = require("./booking.i18n");
async function buildBookingPdf(params) {
    const { booking, lang } = params;
    const t = booking_i18n_1.BOOKING_PDF_I18N[lang] ?? booking_i18n_1.BOOKING_PDF_I18N.en;
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = new stream_1.PassThrough();
    const chunks = [];
    doc.pipe(stream);
    stream.on('data', c => chunks.push(c));
    const watermark = booking.remainingAmount > 0
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
    doc.fontSize(20).text(t.title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`${t.bookingId}: ${booking.id}`);
    doc.moveDown();
    const qrBuffer = await QRCode.toBuffer(booking.id, {
        type: 'png',
        width: 120,
        margin: 1,
    });
    doc.image(qrBuffer, doc.page.width - 160, 40, { width: 100 });
    section(doc, t.trip);
    field(doc, `${booking.trip.departureCountry} (${booking.trip.departureCity}) → ${booking.trip.arrivalCountry} (${booking.trip.arrivalCity})`);
    section(doc, t.client);
    field(doc, `${booking.client.firstName} ${booking.client.lastName}`);
    field(doc, booking.client.email);
    section(doc, t.recipient);
    field(doc, booking.recipientSnapshot.name);
    field(doc, booking.recipientSnapshot.phone);
    field(doc, booking.recipientSnapshot.address);
    section(doc, t.parcels);
    booking.parcels.forEach((p, i) => {
        field(doc, `${t.parcel} ${i + 1}: ${p.weightKg}kg | ${p.lengthCm}x${p.widthCm}x${p.heightCm}cm | €${p.finalPrice.toFixed(2)}`);
    });
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
                field(doc, `${t.openingHours}: ${booking.pickup.details.openingHours}`);
        }
    }
    section(doc, t.delivery);
    field(doc, `${t.option}: ${booking.delivery.option}`);
    if (booking.insurance) {
        section(doc, t.insurance);
        field(doc, `${t.declaredValue}: €${booking.insurance.declaredValue}`);
        field(doc, `${t.coverage}: €${booking.insurance.coverageAmount}`);
        field(doc, `${t.premium}: €${booking.insurance.premiumAmount}`);
    }
    section(doc, t.pricing);
    field(doc, `${t.total}: €${booking.totalPrice.toFixed(2)}`);
    field(doc, `${t.paid}: €${booking.prepaidAmount.toFixed(2)}`);
    field(doc, `${t.remaining}: €${booking.remainingAmount.toFixed(2)}`);
    doc
        .moveDown(2)
        .fontSize(9)
        .fillColor('gray')
        .text(t.footer, { align: 'center' });
    doc.end();
    return new Promise(resolve => stream.on('end', () => resolve(Buffer.concat(chunks))));
}
function section(doc, title) {
    doc.moveDown().fontSize(14).fillColor('#000').text(title);
    doc.moveDown(0.3);
}
function field(doc, value) {
    doc.fontSize(11).fillColor('#000').text(value);
}
//# sourceMappingURL=booking.template.js.map