import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  BadRequestException,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiProduces,
} from '@nestjs/swagger';
import { Response, Request } from 'express';
import { LedgerService } from './ledger.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LedgerEntryType } from '@prisma/client';

interface AuthRequest extends Request {
  user: {
    id: string;
  };
}

@ApiTags('Ledger')
@ApiBearerAuth()
@Controller('transporteur/ledger')
@UseGuards(JwtAuthGuard)
export class LedgerController {
  constructor(private readonly ledger: LedgerService) {}

  // =========================
  // TRANSPORTEUR LEDGER (JSON)
  // =========================
  @Get('me')
  @ApiOperation({ summary: 'Get transporteur ledger' })
  async getMyLedger(@Req() req: AuthRequest) {
    return this.ledger.getTransporteurLedger(req.user.id);
  }

  // =========================
  // EXPORT CSV
  // =========================
  @Get('export')
  @ApiOperation({ summary: 'Export ledger as CSV file' })
  @ApiProduces('text/csv')
  @ApiQuery({ name: 'from', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'to', required: false, example: '2025-01-31' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: LedgerEntryType,
  })
  async exportCsv(
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('type') type?: LedgerEntryType,
  ) {
    // =========================
    // VALIDATION
    // =========================
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    if (from && isNaN(fromDate!.getTime())) {
      throw new BadRequestException('Invalid "from" date');
    }

    if (to && isNaN(toDate!.getTime())) {
      throw new BadRequestException('Invalid "to" date');
    }

    const rows = await this.ledger.getLedgerForExport({
      from: fromDate,
      to: toDate,
      type,
    });

    const csv = this.toCsv(rows);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="ledger-${Date.now()}.csv"`,
    );

    return res.send(csv);
  }

  // =========================
  // CSV GENERATION
  // =========================
  private toCsv(rows: any[]): string {
    const header = [
      'Date',
      'Type',
      'Amount',
      'BookingId',
      'ClientEmail',
      'TransporteurId',
      'HubId',
    ];

    const lines = rows.map((r) => [
      r.createdAt?.toISOString() ?? '',
      r.type ?? '',
      r.amount ?? '',
      r.payment?.bookingId ?? '',
      r.payment?.booking?.client?.email ?? '',
      r.transporteurId ?? '',
      r.hubId ?? '',
    ]);

    return [header, ...lines]
      .map((l) =>
        l
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(','),
      )
      .join('\n');
  }
}