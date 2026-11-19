import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

/** Trims string input before validation runs, so " https://x.com " isn't rejected by @IsUrl. */
const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateSiteDto {
  @ApiProperty({
    description:
      'URL publique à auditer (http ou https uniquement). Normalisée côté serveur : espaces retirés, schéma et domaine en minuscules, fragment (#...) retiré. Une URL déjà connue réutilise le site existant.',
    example: 'https://exemple.canada.ca',
  })
  @Transform(trimString)
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  url!: string;

  @ApiPropertyOptional({
    description: 'Étiquette lisible pour identifier le site',
    example: 'Site vitrine GENIXI',
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(200)
  label?: string;
}
