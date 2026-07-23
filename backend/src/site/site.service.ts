import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Site } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSiteDto } from './dto/create-site.dto';

type SiteWithScans = Prisma.SiteGetPayload<{ include: { scans: true } }>;

@Injectable()
export class SiteService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateSiteDto): Promise<Site> {
    return this.prisma.site.create({ data: dto });
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
