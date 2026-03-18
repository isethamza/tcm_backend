"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMailWorker = startMailWorker;
const bullmq_1 = require("bullmq");
const nodemailer = require("nodemailer");
const template_service_1 = require("../modules/mail/template.service");
const booking_mail_service_1 = require("../modules/bookings/booking-mail.service");
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
async function startMailWorker() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const bookingMail = app.get(booking_mail_service_1.BookingMailService);
    const mailWorker = new bullmq_1.Worker('mail', async (job) => {
        switch (job.name) {
            case 'send-mail': {
                const data = job.data;
                let html = data.html;
                if (data.template) {
                    html = (0, template_service_1.renderTemplate)(data.template, data.data || {}, data.locale);
                }
                if (!html) {
                    throw new Error('No html generated for email');
                }
                await transporter.sendMail({
                    from: `"TCM Logistics" <${process.env.SMTP_FROM}>`,
                    to: data.to,
                    subject: data.subject,
                    html,
                    attachments: data.attachments,
                });
                break;
            }
            case 'booking-pdf-email': {
                const { bookingId, email, lang } = job.data;
                await bookingMail.sendBookingPdfEmail(bookingId, email, lang);
                break;
            }
            case 'pickup-proposal-email': {
                await bookingMail.sendPickupProposalEmail(job.data);
                break;
            }
            default:
                console.warn(`⚠️ Unknown mail job: ${job.name}`);
        }
    }, {
        connection: {
            host: process.env.REDIS_HOST ?? 'redis',
            port: Number(process.env.REDIS_PORT ?? 6379),
        },
        concurrency: 5,
    });
    mailWorker.on('completed', job => {
        console.log(`✅ Mail job completed: ${job.id} (${job.name})`);
    });
    mailWorker.on('failed', (job, err) => {
        console.error(`❌ Mail job failed: ${job?.id} (${job?.name})`, err);
    });
    return mailWorker;
}
//# sourceMappingURL=mail.worker.js.map