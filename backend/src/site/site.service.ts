import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Site } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { normalizeSiteUrl } from './site-url';

type SiteWithScans = Prisma.SiteGetPayload<{ include: { scans: true } }>;

@Injectable()
export class SiteService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns the existing Site for this URL (after normalization) instead of creating a
   * duplicate, so every scan of the same page lands in the same history. If several rows
   * already exist for the URL (created before this behaviour existed), the oldest one is
   * reused; existing rows are never merged or deleted.
   *
   * A label sent for an existing site only fills in a missing label: it never overwrites one.
   */
  async create(dto: CreateSiteDto): Promise<Site> {
    const url = normalizeSiteUrl(dto.url);

    const existing = await this.prisma.site.findFirst({
      where: { url },
      orderBy: { createdAt: 'asc' },
    });

    if (existing) {
      if (dto.label && !existing.label) {
        return this.prisma.site.update({
          where: { id: existing.id },
          data: { label: dto.label },
        });
      }
      return existing;
    }

    return this.prisma.site.create({ data: { url, label: dto.label } });
  }

  findAll(): Promise<SiteWithScans[]> {
    return this.prisma.site.findMany({
      orderBy: { createdAt: 'desc' },
      include: { scans: { orderBy: { startedAt: 'desc' } } },
    });
  }

  async findOne(id: string): Promise<SiteWithScans> {
    const site = await this.prisma.site.findUnique({
      where: { id },
      include: { scans: { orderBy: { startedAt: 'desc' } } },
    });
    if (!site) {
      throw new NotFoundException(`Site ${id} introuvable`);
    }
    return site;
  }
}
