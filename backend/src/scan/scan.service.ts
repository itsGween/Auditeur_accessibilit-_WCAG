import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Scan } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type ScanWithViolations = Prisma.ScanGetPayload<{ include: { violations: true } }>;

@Injectable()
export class ScanService {
  constructor(private readonly prisma: PrismaService) {}

  async create(siteId: string): Promise<Scan> {
    const site = await this.prisma.site.findUnique({ where: { id: siteId } });
    if (!site) {
      throw new NotFoundException(`Site ${siteId} introuvable`);
    }

    // Status stays PENDING here; the scan engine (phase 3) is responsible for
    // running Playwright + axe-core and transitioning it to RUNNING/COMPLETED/FAILED.
    return this.prisma.scan.create({ data: { siteId } });
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
