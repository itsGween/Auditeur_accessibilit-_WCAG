import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportQueryDto } from './dto/report-query.dto';
import { ReportService } from './report.service';

@ApiTags('reports')
@Controller()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('scans/:id/report.csv')
  async getScanCsv(
    @Param('id') id: string,
    @Query() query: ReportQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const lang = query.lang ?? 'fr';
    const csv = await this.reportService.getScanCsv(id, lang);
    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="scan-${id}.csv"`,
    });
    return csv;
  }

  @Get('scans/:id/report.pdf')
  async getScanPdf(
    @Param('id') id: string,
    @Query() query: ReportQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const lang = query.lang ?? 'fr';
    const pdf = await this.reportService.getScanPdf(id, lang);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="scan-${id}.pdf"`,
    });
    res.send(pdf);
  }

  @Get('sites/:id/compliance-statement.pdf')
  async getComplianceStatementPdf(
    @Param('id') id: string,
    @Query() query: ReportQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const lang = query.lang ?? 'fr';
    const pdf = await this.reportService.getComplianceStatementPdf(id, lang);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="declaration-${id}.pdf"`,
    });
    res.send(pdf);
  }
}
