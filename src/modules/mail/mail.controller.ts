import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { renderTemplate } from './template.service';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiAcceptedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

import { SendMailDto } from './dto/send-mail.dto';
import { PreviewTemplateDto } from './dto/preview-template.dto';

@ApiTags('Mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  /**
   * 📬 Send email (queued)
   */
  @Post('send')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Send email (async via queue)',
    description:
      'Queues an email for sending. Supports raw HTML or template-based emails with localization.',
  })
  @ApiAcceptedResponse({
    description: 'Email successfully queued',
    schema: {
      example: {
        success: true,
        message: 'Email queued successfully',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid payload (missing html or template)',
  })
  async sendMail(@Body() body: SendMailDto) {
    if (!body.html && !body.template) {
      throw new Error('Either html or template must be provided');
    }

    await this.mailService.sendMail({
      to: body.to,
      subject: body.subject,
      html: body.html,
      template: body.template,
      data: body.data,
      locale: body.locale,
      attachments: body.attachments?.map((a) => ({
        filename: a.filename,
        content: Buffer.from(a.content, 'base64'),
        contentType: a.contentType,
      })),
    });

    return {
      success: true,
      message: 'Email queued successfully',
    };
  }

  /**
   * 🔍 Preview email template
   */
  @Post('preview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Preview email template',
    description:
      'Renders an email template with provided data and locale. Does not send or queue email.',
  })
  @ApiOkResponse({
    description: 'Rendered HTML preview',
    schema: {
      example: {
        success: true,
        html: '<!doctype html><html>...</html>',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid template or rendering error',
  })
  previewTemplate(@Body() body: PreviewTemplateDto) {
    const html = renderTemplate(
      body.template,
      body.data || {},
      body.locale,
    );

    return {
      success: true,
      html,
    };
  }
}