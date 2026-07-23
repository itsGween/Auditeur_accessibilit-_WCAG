import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ScanService } from './scan.service';

@ApiTags('scans')
@Controller()
export class ScanController {
  constructor(private readonly scanService: ScanService) {}

  @Post('sites/:siteId/scans')
  create(@Param('siteId') siteId: string) {
    return this.scanService.create(siteId);
  }

  @Get('sites/:siteId/scans')
  findAllForSite(@Param('siteId') siteId: string) {
    return this.scanService.findAllForSite(siteId);
  }

  @Get('scans/:id')
  findOne(@Param('id') id: string) {
    return this.scanService.findOne(id);
  }
}
