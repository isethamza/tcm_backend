"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingMailService = void 0;
const common_1 = require("@nestjs/common");
const booking_docs_service_1 = require("./booking-docs.service");
const mail_service_1 = require("../mail/mail.service");
let BookingMailService = class BookingMailService {
    constructor(docs, mail) {
        this.docs = docs;
        this.mail = mail;
    }
    async sendBookingPdfEmail(bookingId, email, lang = 'en') {
        const pdf = await this.docs.generatePdf(bookingId, lang);
        if (!pdf) {
            throw new common_1.NotFoundException('Failed to generate booking PDF');
        }
        const subject = lang === 'fr'
            ? `Votre document de réservation`
            : `Your booking document`;
        const html = lang === 'fr'
            ? `<p>Veuillez trouver votre document de réservation en pièce jointe.</p>`
            : `<p>Please find your booking document attached.</p>`;
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
    async sendPickupProposalEmail(params) {
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
};
exports.BookingMailService = BookingMailService;
exports.BookingMailService = BookingMailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [booking_docs_service_1.BookingDocsService,
        mail_service_1.MailService])
], BookingMailService);
//# sourceMappingURL=booking-mail.service%20-%20Copy.js.map