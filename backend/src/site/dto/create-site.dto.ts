import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateSiteDto {
  @ApiProperty({
    description: 'URL publique à auditer (http ou https uniquement)',
    example: 'https://exemple.canada.ca',
  })
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  url!: string;

  @ApiPropertyOptional({
    description: 'Étiquette lisible pour identifier le site',
    example: 'Site vitrine GENIXI',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string;
}
