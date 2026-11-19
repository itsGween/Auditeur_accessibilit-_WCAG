import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateSiteDto } from './dto/create-site.dto';
import { SiteService } from './site.service';

@ApiTags('sites')
@Controller('sites')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Post()
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description:
      "Site créé, ou site existant renvoyé si l'URL normalisée (schéma et domaine en minuscules, sans fragment) est déjà connue",
  })
  @ApiUnauthorizedResponse({
    description: "Jeton d'accès (MUTATION_API_TOKEN) manquant ou invalide",
  })
  create(@Body() dto: CreateSiteDto) {
    return this.siteService.create(dto);
  }

  @Get()
  findAll() {
    return this.siteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.siteService.findOne(id);
  }
}
