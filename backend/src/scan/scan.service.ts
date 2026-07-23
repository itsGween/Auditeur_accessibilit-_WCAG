import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Scan } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ScanEngineService } from './scan-engine.service';

type ScanWithViolations = Prisma.ScanGetPayload<{ include: { violations: true } }>;

const DEFAULT_SCAN_TIMEOUT_MS = 30000;

@Injectable()
export class ScanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scanEngine: ScanEngineService,
    private readonly config: ConfigService,
  ) {}

  async create(siteId: string): Promise<Scan> {
    const site = await this.prisma.site.findUnique({ where: { id: siteId } });
    if (!site) {
      throw new NotFoundException(`Site ${siteId} introuvable`);
    }

    const scan = await this.prisma.scan.create({ data: { siteId, status: 'RUNNING' } });

    try {
      const timeoutMs =
        Number(this.config.get<string>('SCAN_TIMEOUT_MS')) || DEFAULT_SCAN_TIMEOUT_MS;
      const { violations, passCount } = await this.scanEngine.run(site.url, timeoutMs);

      if (violations.length > 0) {
        await this.prisma.violation.createMany({
          data: violations.map((violation) => ({ ...violation, scanId: scan.id })),
        });
      }

      return await this.prisma.scan.update({
        where: { id: scan.id },
        data: {
          status: 'COMPLETED',
          finishedAt: new Date(),
          passCount,
          violationCount: violations.length,
        },
      });
    } catch (error) {
      await this.prisma.scan.update({
        where: { id: scan.id },
        data: { status: 'FAILED', finishedAt: new Date() },
      });
      throw error;
    }
  }

  findAllForSite(siteId: string): Promise<Scan[]> {
    return this.prisma.scan.findMany({
      where: { siteId },
      orderBy: { startedAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<ScanWithViolations> {
    const scan = await this.prisma.scan.findUnique({
      where: { id },
      include: { violations: true },
    });
    if (!scan) {
      throw new NotFoundException(`Scan ${id} introuvable`);
    }
    return scan;
  }
}
