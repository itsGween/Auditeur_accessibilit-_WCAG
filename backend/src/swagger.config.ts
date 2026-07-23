import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

export function buildSwaggerDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('WCAG Auditor API')
    .setDescription('API pour auditer la conformité WCAG 2.1 AA des URLs publiques')
    .setVersion('0.1.0')
    .build();
  return SwaggerModule.createDocument(app, config);
}
