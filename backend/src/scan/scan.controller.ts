import { Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ScanService } from './scan.service';

@ApiTags('scans')
@Controller()
export class ScanController {
  constructor(private readonly scanService: ScanService) {}

  @Post('sites/:siteId/scans')
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Scan exécuté de façon synchrone; renvoie le scan COMPLETED',
  })
  @ApiUnauthorizedResponse({
    description: "Jeton d'accès (MUTATION_API_TOKEN) manquant ou invalide",
  })
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
