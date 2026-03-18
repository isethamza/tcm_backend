import { Injectable, NotFoundException } from '@nestjs/common';
import { BookingDocsService } from './booking-docs.service';
import { MailService } from '../mail/mail.service';
import { PdfLang } from './pdf/pdf-lang';

@Injectable()
export class BookingMailService {
  constructor(
    private readonly docs: BookingDocsService,
    private readonly mail: MailService,
  ) {}

  /* ============================================
     SEND BOOKING PDF VIA EMAIL
  ============================================ */
  async sendBookingPdfEmail(
    bookingId: string,
    email: string,
    lang: PdfLang = 'en',
  ) {
    /* ===============================
       1. GENERATE PDF
    =============================== */
    const pdf = await this.docs.generatePdf(bookingId, lang);

    if (!pdf) {
      throw new NotFoundException('Failed to generate booking PDF');
    }

    /* ===============================
       2. BUILD EMAIL CONTENT
    =============================== */

    const subject =
      lang === 'fr'
        ? `Votre document de réservation`
        : `Your booking document`;

    const html =
      lang === 'fr'
        ? `<p>Veuillez trouver votre document de réservation en pièce jointe.</p>`
        : `<p>Please find your booking document attached.</p>`;

    /* ===============================
       3. SEND EMAIL
    =============================== */

    await this.mail.sendMail({
      to: email,
      subject,
      html,
      attachments: [
        {
          filename: `booking-${bookingId}.pdf`,
          content: pdf,
          contentType: 'application/pdf',
        },
      ],
    });

    return {
      success: true,
      message: 'Booking PDF sent successfully',
    };
  }
 /* ============================================
     SEND PICKUP SLOT POPOSAL VIA EMAIL
  ============================================ */

async sendPickupProposalEmail(params: {
  to: string;
  slotStart: Date;
  slotEnd: Date;
  tripId: string;
}) {
  const { to, slotStart, slotEnd, tripId } = params;
await this.mail.sendMail({
  to,
  subject: 'Pickup Time Proposal',
  template: 'pickup-proposal',
  data: {
    slotStart,
    slotEnd,
    tripId,
  },
});

}
}