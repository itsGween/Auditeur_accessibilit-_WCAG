import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateSiteDto } from './dto/create-site.dto';
import { SiteService } from './site.service';

@ApiTags('sites')
@Controller('sites')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Post()
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
