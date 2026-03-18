import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface SendMailJob {
  to: string;
  subject: string;

  html?: string;

  template?: string;
  data?: Record<string, any>;
  locale?: string;

  attachments?: {
    filename: string;
    content: Buffer;
    contentType?: string;
  }[];
}

const DEFAULT_LOCALE = 'en';

@Injectable()
export class MailService {
  constructor(
    @InjectQueue('mail') private readonly mailQueue: Queue,
  ) {}

  async sendMail(params: SendMailJob) {
    // ✅ Validation aligned with controller
    if (!params.html && !params.template) {
      throw new BadRequestException(
        'Either html or template must be provided',
      );
    }

    if (params.template && !params.data) {
      params.data = {};
    }

    // ✅ Ensure locale fallback
    const jobData: SendMailJob = {
      ...params,
      locale: params.locale ?? DEFAULT_LOCALE,
    };

    await this.mailQueue.add('send-mail', jobData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,

      // ✅ Optional but recommended
      // prevents duplicate emails (same payload)
      jobId: this.buildJobId(jobData),
    });
  }

  /**
   * 🔐 Simple deduplication strategy
   */
  private buildJobId(params: SendMailJob) {
    return [
      params.to,
      params.subject,
      params.template ?? 'html',
      params.locale ?? 'en',
    ].join(':');
  }
}