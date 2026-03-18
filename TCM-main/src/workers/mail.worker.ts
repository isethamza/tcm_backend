import { Worker, Job } from 'bullmq';
import * as nodemailer from 'nodemailer';
import { renderTemplate } from '../modules/mail/template.service';
import { BookingMailService } from '../modules/bookings/booking-mail.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

// =====================================================
// TYPES
// =====================================================

interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

interface SendMailJob {
  to: string;
  subject: string;
  html?: string;
  template?: string;
  data?: Record<string, any>;
  locale?: string;
  attachments?: MailAttachment[];
}

// =====================================================
// TRANSPORTER
// =====================================================

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// =====================================================
// ✅ EXPORT FACTORY FUNCTION (Option A)
// =====================================================

export async function startMailWorker(): Promise<Worker> {
  const app = await NestFactory.createApplicationContext(AppModule);
  const bookingMail = app.get(BookingMailService);

  const mailWorker = new Worker(
    'mail',
    async (job: Job<any>) => {
      switch (job.name) {
        case 'send-mail': {
          const data = job.data as SendMailJob;

          let html = data.html;

          if (data.template) {
            html = renderTemplate(
              data.template,
              data.data || {},
              data.locale,
            );
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

          await bookingMail.sendBookingPdfEmail(
            bookingId,
            email,
            lang,
          );
          break;
        }

        case 'pickup-proposal-email': {
          await bookingMail.sendPickupProposalEmail(job.data);
          break;
        }

        default:
          console.warn(`⚠️ Unknown mail job: ${job.name}`);
      }
    },
    {
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
      concurrency: 5,
    },
  );

  // =====================================================
  // EVENTS
  // =====================================================

  mailWorker.on('completed', job => {
    console.log(`✅ Mail job completed: ${job.id} (${job.name})`);
  });

  mailWorker.on('failed', (job, err) => {
    console.error(
      `❌ Mail job failed: ${job?.id} (${job?.name})`,
      err,
    );
  });

  return mailWorker; // ✅ REQUIRED
}